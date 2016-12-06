# Valence

An independent development of a vanilla JavaScript Library to get the data from Brightspaces's Valence API.

## Supported Valence API calls

1. `/d2l/api/lp/${ver}/users/whoami`

    `valence('whoami', e => {console.log(e)})`
    
2. `/d2l/api/le/${ver}/${ou}/grades/values/myGradeValues/`

    `valence('getFinalGrade', e => {console.log(e)})`