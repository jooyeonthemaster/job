@echo off
echo Setting up Firebase Storage CORS configuration...
echo.
echo Make sure you have Google Cloud SDK installed and configured.
echo.
echo Running: gsutil cors set cors.json gs://YOUR_BUCKET_NAME.appspot.com
echo.
echo Please replace YOUR_BUCKET_NAME with your actual Firebase project ID.
echo For example: gsutil cors set cors.json gs://jobmatch-12345.appspot.com
echo.
pause