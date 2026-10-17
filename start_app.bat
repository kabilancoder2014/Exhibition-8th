@echo off
title AI Career Recommendation System - 8th Exhibition
echo ======================================================================
echo    AI CAREER RECOMMENDATION SYSTEM - 8TH SCIENCE EXHIBITION 2026
echo ======================================================================
echo Starting local web server on port 8080...
echo Opening application in default browser...
start http://localhost:8080
python -m http.server 8080
pause
