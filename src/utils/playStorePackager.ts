import JSZip from 'jszip';

export interface PlayStoreConfig {
  appName: string;
  shortName: string;
  packageName: string;
  versionCode: number;
  versionName: string;
  webUrl: string;
  themeColor: string;
  backgroundColor: string;
  description: string;
}

export const DEFAULT_PLAYSTORE_CONFIG: PlayStoreConfig = {
  appName: 'PDF Suite - Document & PDF Converter',
  shortName: 'PDF Suite',
  packageName: 'com.pdfsuite.converter',
  versionCode: 1,
  versionName: '1.0.0',
  webUrl: typeof window !== 'undefined' ? window.location.origin : 'https://pdf-suite.app',
  themeColor: '#dc2626',
  backgroundColor: '#0f172a',
  description: 'Fast, secure, all-in-one PDF and Document converter for Android. Convert Word, images, sheets, text to PDF, merge, split, compress, and scan with Gemini AI OCR.',
};

/**
 * Generate a complete ready-to-build Android Studio & Google Play Store package ZIP
 */
export async function generatePlayStorePackageZip(customConfig?: Partial<PlayStoreConfig>): Promise<Blob> {
  const config = { ...DEFAULT_PLAYSTORE_CONFIG, ...customConfig };
  const zip = new JSZip();

  // 1. AndroidManifest.xml
  const androidManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${config.packageName}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${config.appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.PDFSuite">

        <!-- Trusted Web Activity (TWA) Main Activity for Google Play Store -->
        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:label="${config.shortName}"
            android:exported="true">

            <!-- Meta-data for TWA Web URL -->
            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="${config.webUrl}" />
            
            <meta-data
                android:name="android.support.customtabs.trusted.STATUS_BAR_COLOR"
                android:resource="@color/colorPrimary" />

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Digital Asset Links & Web URL Verification -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="${new URL(config.webUrl).hostname}" />
            </intent-filter>

            <!-- Intent Filter for Handling PDF Files from Android System -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="application/pdf" />
                <data android:mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                <data android:mimeType="image/*" />
            </intent-filter>
        </activity>

        <meta-data
            android:name="asset_statements"
            android:resource="@string/asset_statements" />
    </application>
</manifest>`;

  // 2. build.gradle (Module: app)
  const buildGradle = `plugins {
    id 'com.android.application'
}

android {
    namespace '${config.packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${config.packageName}"
        minSdk 21
        targetSdk 34
        versionCode ${config.versionCode}
        versionName "${config.versionName}"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        
        manifestPlaceholders = [
            hostName: "${new URL(config.webUrl).hostname}",
            defaultUrl: "${config.webUrl}",
            assetStatements: '[{\\"relation\\": [\\"delegate_permission/common.handle_all_urls\\"], \\"target\\": {\\"namespace\\": \\"android_app\\", \\"package_name\\": \\"${config.packageName}\\", \\"sha256_cert_fingerprints\\": [\\"YOUR_SHA256_FINGERPRINT_HERE\\"]}}]'
        ]
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.debug // Replace with your release signing config
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
}`;

  // 3. twa-manifest.json (For Bubblewrap CLI)
  const twaManifestJson = JSON.stringify({
    packageId: config.packageName,
    host: new URL(config.webUrl).hostname,
    name: config.appName,
    launcherName: config.shortName,
    themeColor: config.themeColor,
    navigationColor: config.backgroundColor,
    backgroundColor: config.backgroundColor,
    enableNotifications: true,
    startUrl: '/',
    iconUrl: `${config.webUrl}/favicon.svg`,
    maskableIconUrl: `${config.webUrl}/favicon.svg`,
    appVersionCode: config.versionCode,
    appVersionName: config.versionName,
    shortcuts: [
      { name: "Merge PDF", short_name: "Merge", url: "/?tool=merge" },
      { name: "Compress PDF", short_name: "Compress", url: "/?tool=compress" },
      { name: "Scan Document", short_name: "Scan", url: "/?tool=image-to-pdf&source=camera" },
      { name: "AI OCR", short_name: "AI OCR", url: "/?tool=ai-ocr" }
    ],
    generatorApp: "bubblewrap-cli",
    webManifestUrl: `${config.webUrl}/manifest.json`,
    fallbackType: "customtabs",
    features: {
      locationDelegation: { enabled: false },
      playBilling: { enabled: false }
    },
    alphaDependencies: {
      enabled: false
    }
  }, null, 2);

  // 4. assetlinks.json (For Digital Asset Links)
  const assetlinksJson = JSON.stringify([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: config.packageName,
        sha256_cert_fingerprints: [
          "14:6D:E9:7F:0F:52:EA:43:57:EC:87:47:50:5E:AB:A6:DC:9A:07:44:85:0B:4E:EA:9E:09:4D:3E:59:D9:EC:79"
        ]
      }
    }
  ], null, 2);

  // 5. Play Store Listing & Description Metadata
  const playStoreListing = `# Google Play Store Listing Copy & Metadata

## App Details
- **Title (Max 30 chars)**: PDF Suite - Convert & OCR
- **Short Description (Max 80 chars)**: Convert Word, images, text to PDF, merge, split, compress, and AI OCR scanner.
- **Category**: Productivity / Tools
- **Content Rating**: Everyone (PEGI 3 / ESRB Everyone)
- **Contact Email**: support@pdfsuite.app

## Full Description (Formatted for Google Play Store SEO):
PDF Suite is your all-in-one, ultra-fast document workstation and PDF converter designed specifically for Android.

★ CORE FEATURES ★
• Word (.docx) to PDF: Convert docs with flawless formatting.
• Images (JPG/PNG/WebP) to PDF: Merge camera scans into single or multi-page documents.
• Compress PDF: Reduce heavy file sizes by up to 70% without losing readable quality.
• Merge & Split: Combine multiple PDF files or extract selective page ranges.
• Rotate & Organize: Reorder, delete, and rotate PDF pages in 90° increments.
• Sign & Watermark: Draw or type signatures and stamp confidential watermarks.
• AI OCR Document Scanner: Extract clean editable text and tables with Gemini AI.
• AI Executive Summaries & 30+ Language Document Translation.

★ PRIVACY FIRST ★
Your files are processed securely in real-time. No cloud hoarding, 100% encrypted and safe.

★ ZERO CLUTTER ★
Clean, modern Android design with offline caching, camera scanner integration, and fast native sharing to WhatsApp, Gmail, and Google Drive.
`;

  // 6. Step-by-Step Google Play Console Guide
  const readmePlayStore = `# Step-by-Step Google Play Store Integration & Release Guide

This package contains all files required to publish **${config.appName}** to the **Google Play Store** as a verified Android App Bundle (.aab) using Trusted Web Activity (TWA).

---

### METHOD A: Fastest 1-Click Route via PWABuilder (Recommended)
1. Go to **https://www.pwabuilder.com**
2. Paste your live web URL: \`${config.webUrl}\`
3. Click **"Package for Stores"** -> Select **"Android"**.
4. In the settings modal:
   - Package ID: \`${config.packageName}\`
   - App name: \`${config.shortName}\`
   - Signing Key: Select *"Generate New Keystore"* (or upload existing).
5. Click **"Generate Android App Bundle (.aab)"**.
6. Download the generated \`.zip\` containing your signed \`app-release.aab\`.
7. Upload this \`.aab\` directly to **Google Play Console** (Production or Internal Testing track)!

---

### METHOD B: Using Official Google Bubblewrap CLI (Automated Terminal)
1. Ensure Node.js and JDK 17+ / Android SDK are installed.
2. Run in terminal:
   \`\`\`bash
   npx @bubblewrap/cli init --manifest="${config.webUrl}/manifest.json"
   \`\`\`
3. Follow the CLI prompts (enter your keystore password or generate one).
4. Run:
   \`\`\`bash
   npx @bubblewrap/cli build
   \`\`\`
5. Output file \`app-release-signed.aab\` will be generated ready for Google Play Store upload.

---

### METHOD C: Android Studio Project
1. Open Android Studio -> Select *Open Existing Project*.
2. Copy the included \`AndroidManifest.xml\` and \`build.gradle\` into your \`app/\` module.
3. Build -> **Generate Signed Bundle / APK** -> **Android App Bundle (.aab)**.

---

### DIGITAL ASSET LINKS VERIFICATION (Removes browser bar in Android app)
1. Google Play Console will give you your App's SHA-256 fingerprint.
2. Put that fingerprint inside \`.well-known/assetlinks.json\` on your server:
   \`${config.webUrl}/.well-known/assetlinks.json\`
3. Once verified, the Android app will launch in pure full-screen standalone mode without any browser URL bar.
`;

  // Add files to zip
  zip.file('AndroidManifest.xml', androidManifestXml);
  zip.file('build.gradle', buildGradle);
  zip.file('twa-manifest.json', twaManifestJson);
  zip.file('assetlinks.json', assetlinksJson);
  zip.file('PLAY_STORE_LISTING.md', playStoreListing);
  zip.file('README_PLAY_STORE_GUIDE.md', readmePlayStore);

  return await zip.generateAsync({ type: 'blob' });
}
