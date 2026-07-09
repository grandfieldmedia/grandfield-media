@echo off
REM Srini.pro Image Downloader - Batch Script
REM Downloads all 20 images from srini.pro
REM Author: Generated Script
REM Date: 2026-07-09

setlocal enabledelayedexpansion

REM Set output folder
set "OUTPUT_FOLDER=D:\Dropbox\grandfield-media\sites\srini-pro\public\images"

REM Create output folder if it doesn't exist
if not exist "%OUTPUT_FOLDER%" (
    mkdir "%OUTPUT_FOLDER%"
    echo Created folder: %OUTPUT_FOLDER%
)

echo.
echo ========================================
echo Srini.pro Image Downloader
echo ========================================
echo Output Folder: %OUTPUT_FOLDER%
echo Total Images: 20
echo ========================================
echo.

REM Initialize counters
set "SUCCESS_COUNT=0"
set "FAILURE_COUNT=0"
set "SKIP_COUNT=0"

REM Define images and download
REM Note: Replace 'curl' with 'wget' if you prefer wget instead

REM Image 1: Logo
echo [DOWNLOADING] logo-srini-pro-300x300.png...
curl -o "%OUTPUT_FOLDER%\logo-srini-pro-300x300.png" "https://srini.pro/wp-content/uploads/2026/06/Srini-pro-Logo-300x300.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 2: Logo Cropped
echo [DOWNLOADING] logo-full-cropped.png...
curl -o "%OUTPUT_FOLDER%\logo-full-cropped.png" "https://srini.pro/wp-content/uploads/2026/06/cropped-Full-Logo.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 3: Logo White
echo [DOWNLOADING] logo-full-white.png...
curl -o "%OUTPUT_FOLDER%\logo-full-white.png" "https://srini.pro/wp-content/uploads/2026/06/Full-Logo-White.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 4: Hero Home
echo [DOWNLOADING] hero-home.png...
curl -o "%OUTPUT_FOLDER%\hero-home.png" "https://srini.pro/wp-content/uploads/2026/07/FeatureHomeImage.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 5: Hero Free Courses
echo [DOWNLOADING] hero-free-courses.png...
curl -o "%OUTPUT_FOLDER%\hero-free-courses.png" "https://srini.pro/wp-content/uploads/2026/07/FreeCourses.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 6: Instructor Srini 300x300
echo [DOWNLOADING] instructor-srini-300x300.png...
curl -o "%OUTPUT_FOLDER%\instructor-srini-300x300.png" "https://srini.pro/wp-content/uploads/2026/06/srini-300x300.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 7: Instructor Srini Vanamala
echo [DOWNLOADING] instructor-srini-vanamala.jpg...
curl -o "%OUTPUT_FOLDER%\instructor-srini-vanamala.jpg" "https://srini.pro/wp-content/uploads/2026/06/srinivanamala.jpg" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 8: Instructor Srini Profile
echo [DOWNLOADING] instructor-srini-profile.png...
curl -o "%OUTPUT_FOLDER%\instructor-srini-profile.png" "https://srini.pro/wp-content/uploads/2026/06/srini.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 9: Course SAP PO Mastery
echo [DOWNLOADING] course-sap-po-mastery.png...
curl -o "%OUTPUT_FOLDER%\course-sap-po-mastery.png" "https://srini.pro/wp-content/uploads/2026/07/sap-po-mastery.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 10: Course SAP CPI
echo [DOWNLOADING] course-sap-cpi.png...
curl -o "%OUTPUT_FOLDER%\course-sap-cpi.png" "https://srini.pro/wp-content/uploads/2026/06/SAP-CPI.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 11: Course SAP BTP
echo [DOWNLOADING] course-sap-btp.png...
curl -o "%OUTPUT_FOLDER%\course-sap-btp.png" "https://srini.pro/wp-content/uploads/2026/06/SAP-BTP-Website.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 12: Course SAP Integration Suite
echo [DOWNLOADING] course-sap-integration-suite.png...
curl -o "%OUTPUT_FOLDER%\course-sap-integration-suite.png" "https://srini.pro/wp-content/uploads/2026/06/SAP-Integration-Suite-Website2.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 13: Course SAP AI
echo [DOWNLOADING] course-sap-ai.png...
curl -o "%OUTPUT_FOLDER%\course-sap-ai.png" "https://srini.pro/wp-content/uploads/2026/06/SAP-AI-1.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 14: Course API REST JSON
echo [DOWNLOADING] course-api-rest-json.jpg...
curl -o "%OUTPUT_FOLDER%\course-api-rest-json.jpg" "https://srini.pro/wp-content/uploads/2026/06/0550156697a4470496949e8fb6de96e5.jpg" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 15: Course Cloud Computing
echo [DOWNLOADING] course-cloud-computing.jpg...
curl -o "%OUTPUT_FOLDER%\course-cloud-computing.jpg" "https://srini.pro/wp-content/uploads/2026/06/8e5b1879fd1a48e2a12bfb52ea17df2f.jpg" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 16: Testimonial James McMullen
echo [DOWNLOADING] testimonial-james-mcmullen.jpg...
curl -o "%OUTPUT_FOLDER%\testimonial-james-mcmullen.jpg" "https://srini.pro/wp-content/uploads/2026/06/James-T.-McMullen.jpg" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 17: Testimonial Helen Motz
echo [DOWNLOADING] testimonial-helen-motz.jpg...
curl -o "%OUTPUT_FOLDER%\testimonial-helen-motz.jpg" "https://srini.pro/wp-content/uploads/2026/06/Helen-B.-Motz.jpg" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 18: Testimonial Rahul Sharma
echo [DOWNLOADING] testimonial-rahul-sharma.png...
curl -o "%OUTPUT_FOLDER%\testimonial-rahul-sharma.png" "https://srini.pro/wp-content/uploads/2026/06/1.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 19: Illustration Celebration
echo [DOWNLOADING] illustration-celebration.png...
curl -o "%OUTPUT_FOLDER%\illustration-celebration.png" "https://srini.pro/wp-content/uploads/2026/06/illustration-art-dance-happy-party-celebration-flat.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

REM Image 20: Course ChatGPT Image
echo [DOWNLOADING] course-chatgpt-image.png...
curl -o "%OUTPUT_FOLDER%\course-chatgpt-image.png" "https://srini.pro/wp-content/uploads/2026/06/ChatGPT-Image-Jun-27-2026-02_34_58-AM-1024x1024.png" && set /a SUCCESS_COUNT+=1 || set /a FAILURE_COUNT+=1

echo.
echo ========================================
echo Download Summary
echo ========================================
echo Successful: %SUCCESS_COUNT%
echo Failed: %FAILURE_COUNT%
echo ========================================
echo.

if %FAILURE_COUNT% equ 0 (
    echo All downloads completed successfully!
) else (
    echo Some downloads failed. Please check the errors above.
)

echo.
echo Images saved to: %OUTPUT_FOLDER%
echo.

pause