# Cefored Institute Website

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration values in `.env`

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

## Firebase Security

The Firebase configuration is now stored in environment variables. Make sure to:

1. **Never commit `.env` to version control** (it's in `.gitignore`)
2. **Configure Firestore security rules** properly in `firestore.rules`
3. **Set up domain restrictions** in Firebase Console
4. **Configure API key restrictions** in Google Cloud Console

## Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Build the project: `npm run build`
3. Deploy the `dist` folder

## Security Notes

Even with environment variables, Firebase config will be visible in the browser since this is a client-side application. Real security comes from:
- Firestore security rules
- Domain restrictions
- API key restrictions
- Proper authentication (if implemented)
