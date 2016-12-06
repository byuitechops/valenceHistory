# Valence

An independent development of a vanilla JavaScript Library to get the data from Brightspaces's Valence API.

## Elevator Pitch

This library is meant as a shortcut alternative as opposed to using jQuery and writing out the API route.  This library has a directory which will link the shortened API call with the real API call.

## Overview

Attach the library from Equella to your content page to access all the features.  Once attached, invoke the library by typing `valence()` with the shortened API call within the parenthesis as a the first parameter and the second parameter is a callback function.  The callback function accepts one parameter.  

## Features

1. Super small
2. AJAX based
3. Contains Directory to link shortened API calls to the full version
4. Supports asynchronous AJAX (and sync...)
5. UMD based module (no support for AMD though)

## Supported Valence API calls

1. `/d2l/api/lp/${ver}/users/whoami`

    `valence('whoami', e => {console.log(e)})`
    
2. `/d2l/api/le/${ver}/${ou}/grades/values/myGradeValues/`

    `valence('getFinalGrade', e => {console.log(e)})`
    
## For the Developer

This repository contains an eslint standard and the code is compiled and minified through Babel.  To make additional changes, clone the repository and then compile and minify the code.  Once all is finished, then submit the changes.

An additional change could be an additional needed API call in the directory.