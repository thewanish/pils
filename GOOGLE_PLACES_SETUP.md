# One-Time Google Places Image Setup

## 1. Get Google Places API Key

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create a new project (or select existing)
3. Enable **Places API** and **Places API (New)**
4. Create credentials → API Key
5. Copy the API key

## 2. Download Firebase Service Account Key

1. Go to: https://console.firebase.google.com/project/pilsen-4134f/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Save as `serviceAccountKey.json` in project root (NOT in git!)

## 3. Install Dependencies

```bash
npm install axios
```

## 4. Run the Script

```bash
# Edit scripts/fetch-pub-images.js and add your Google API key
# Replace: YOUR_GOOGLE_PLACES_API_KEY

node scripts/fetch-pub-images.js
```

## 5. Monitor Progress

The script will:
- ✅ Process all 1443 unique pubs (~25 minutes)
- ✅ Save images to Firestore `pub_images` collection
- ✅ Skip duplicates if you re-run it
- ✅ Use placeholder for pubs without photos
- ✅ Save results to `pub-images-results.json`

## 6. Cost

- **One-time**: ~$35 (covered by $200 free credit)
- **Monthly**: ~$0-2 (only new pubs)
- **Images**: Permanent URLs (no expiration)

## 7. Done!

Your app will now automatically show pub images when loading beer data. No more API calls needed unless new pubs appear in monthly scrapes.

## Security Notes

- ✅ Add `serviceAccountKey.json` to `.gitignore`
- ✅ Add `pub-images-results.json` to `.gitignore`
- ✅ Never commit API keys to git
