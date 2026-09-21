# S M Centering — Windows EXE ஆக Convert பண்றது (Electron Wrapper)

## 🔐 புது Feature: Admin Login

App-ல இப்போ **Login screen** வந்திருக்கு:

- **முதல் தடவை open பண்ணும்போது** — Admin Username, Password, மற்றும் ஒரு **Security Code** set பண்ணச் சொல்லும் (Generate பட்டனை press பண்ணி code வாங்கிக்கோங்க). **இந்த Security Code-ஐ கண்டிப்பா வேற இடத்துல எழுதி வையுங்க** — password மறந்தா இதுதான் reset பண்ண உதவும்.
- அடுத்தடுத்த தடவை open பண்ணும்போது Username + Password கேட்கும்.
- Password மறந்துடீங்கன்னா, Login screen-ல **"Forgot password?"** press பண்ணி, Security Code வச்சு புது password வைக்கலாம்.
- Login ஆனப்புறம் **👤 Profile** tab-க்குப் போய் Username, Password, Security Code மூணையும் மாத்தலாம் (ஒவ்வொரு மாற்றத்துக்கும் இப்போவைய password கேட்கும்).
- இந்த login credentials இந்த PC-ல (`data\S_M_Centering_Data.json`) தான் save ஆகும் — password plain-text-ல அல்ல, encrypted (hashed) ஆகதான் store ஆகும்.

---

இந்த folder-ல உங்க `index.html` (S M Centering app) அப்படியே வச்சிருக்கேன் —
ஒரு line கூட மாத்தல, function எதுவும் miss ஆகல. இத ஒரு **Electron** shell-ல
wrap பண்ணி, single portable `.exe` ஆக build பண்றதுக்கு தேவையான files மட்டும்
சேர்த்திருக்கேன் (`main.js`, `package.json`, GitHub Actions workflow).

உங்க app code-ல already `require('fs')`, `require('http')`, `require('os')`
மாதிரி Node.js code இருக்கு (network sync + data file save பண்ண). அதனால
இது ஒரு plain browser tab-ல run ஆகாது — Electron desktop app-ஆ தான் run
ஆகணும். அந்த வேலைய தான் இந்த wrapper பண்ணும்.

---

## 1) Data எங்க save ஆகும்?

`index.html`-ல already இருக்கிற code, exe எங்க இருக்கோ அதே folder-ல
`data` எனும் folder create பண்ணி, அதுக்குள்ள 3 JSON files save பண்ணும்:

```
YourFolder\
  S_M_Centering.exe
  data\
    S_M_Centering_Data.json           (பில், inventory, customer, employee etc.)
    S_M_Centering_AlertSettings.json
    S_M_Centering_NetworkConfig.json
```

- இது **portable exe** ஆனதால், exe-ஐ எந்த folder-ல வச்சு run பண்றீங்களோ
  (Pen drive, D: drive, Desktop folder etc.) அதே folder-க்குள்ள `data`
  folder வரும் — **C: drive-ல எங்கயும் தானா போய் save ஆகாது.**
- exe-ஐ move பண்ணா, `data` folder-யும் அதோட சேர்த்து move பண்ணிட்டா,
  உங்க பில் records எல்லாம் அப்படியே வரும்.
- **Backup tip:** exe இருக்கிற folder full-ஆ (exe + data இரண்டையும்) copy
  வச்சிருங்க — accidental delete/format ஆனாலும் data safe.

## 2) Local-ஆ (உங்க Windows PC-ல) build பண்றது எப்படி?

Prerequisite: [Node.js](https://nodejs.org) (LTS version) install பண்ணிருக்கணும்.

```bash
# 1. இந்த folder முழுசையும் உங்க Windows PC-க்கு copy பண்ணுங்க
cd sm-centering-app

# 2. Dependencies install பண்ணுங்க (இது ஒரே தடவை, internet வேணும்)
npm install

# 3. Portable exe build பண்ணுங்க
npm run dist
```

Build முடிஞ்சதும் `dist\S_M_Centering.exe` எனும் single file வரும்.
அத எடுத்து எந்த Windows PC-லயும் double-click பண்ணி நேரடியா open
பண்ணலாம் — install தேவையில்ல, browser தேவையில்ல.

## 3) Internet/Node.js இல்லாம, GitHub-ஏ build பண்ண வைக்கிறது (recommended)

உங்க PC-ல npm install பண்ண Node.js install பண்ண முடியலைனா, GitHub-ஓட
free "Actions" service-ஐ வச்சே build பண்ணி exe-ஐ Release-ல போட வைக்கலாம்:

1. இந்த folder முழுசையும் ஒரு புது GitHub repo-வா push பண்ணுங்க
   (`.github/workflows/build.yml` file இருக்கிறதால, push பண்றதே
   automatic-ஆ Windows machine-ல build start பண்ணிடும்).
2. Repo-வோட **Actions** tab-க்கு போய் build finish ஆகும் வரைக்கும் காத்திருங்க
   (~3-5 நிமிஷம்). Build முடிஞ்சதும் அந்த run-ல `S_M_Centering_exe`
   எனும் artifact-ஆ exe கிடைக்கும்.
3. **Direct download link (Release) வேணும்னா:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   tag push பண்ணதும், workflow தானா ஒரு **GitHub Release** create பண்ணி,
   அதுக்குள்ள `.exe`-ஐ attach பண்ணிடும். Users, உங்க repo-ஓட **Releases**
   page-க்கு போய் `.exe`-ஐ நேரடியா download பண்ணலாம் — repo code பார்க்க
   வேண்டியதில்ல, browser-ல app open ஆகாது, download ஆன exe-ஐ double-click
   பண்ணா நேரடியா software window திறக்கும்.

## 4) Network Sync (2 PC / பல PC, WiFi/LAN)

App-ல already "Network Sync" panel இருக்கு (Server PC / Client PC mode).
இது exe-ஆனா ஒழுங்கா வேலை செய்யும் (Node's `http` module use பண்றதால). 
Issue வராம இருக்க:

- Server ஆக இயங்குற PC-ல, முதல் தடவை run பண்ணும்போது **Windows Defender
  Firewall** ஒரு popup காட்டும் ("Allow access") — அதுக்கு **Allow** கொடுங்க.
  Allow கொடுக்கலைனா மத்த PC-ங்க connect பண்ண முடியாது.
- எல்லா PCயும் **ஒரே WiFi/LAN network**-ல இருக்கணும்.
- Server PC-ஓட IP address மாறாம இருக்க (router-ல static IP / DHCP
  reservation வச்சுக்கிறது நல்லது), இல்லனா client PCக்கள மறுபடி IP
  கொடுக்கணும்.
- Client PC network disconnect ஆனா, app already offline mode-க்கு switch
  ஆகி local-ஆ வேலை செய்யும்; connection திரும்ப வந்ததும் தானா sync ஆகிடும்
  (இது already code-ல handle பண்ணிருக்காங்க).

## 5) "100% bugs இல்லாம" பத்தி ஒரு நியாயமான குறிப்பு

நான் உங்க app-ஓட logic-ஐ (billing, inventory, sync) **ஒரு வரி கூட மாத்தல்ல** —
அதனால இதுக்கு முன்னாடி app-ல இருந்த ஏதாவது bug இருந்தா, exe ஆனாலும் அதே
bug இருக்கும். இந்த wrapper செய்யிறது single-exe packaging மட்டும்.
App logic-ல ஏதாவது specific bug பாத்தா (எ.கா. stock calculation தப்பா
வருது, sync-ல data lose ஆகுது), அந்த specific issue-ஐ சொல்லுங்க —
அத தனியா பாத்து சரி பண்றேன்.

---

### Files இதுல இருக்கு

```
sm-centering-app/
  index.html              ← உங்க original app (மாற்றம் இல்லாம)
  main.js                 ← Electron entry point
  package.json            ← build config (electron-builder, portable target)
  .github/workflows/build.yml  ← GitHub-ல auto build + release
  .gitignore
```
