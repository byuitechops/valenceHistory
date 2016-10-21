module.exports = (function () {
/********************* VARIABLES *********************/

/*
    asyn, request, auth, and query -- Import other used node.js libraries
    data -- Where the valence data saved
    grade -- Template representing a valence grade object (When you copy, use the extend helper function. Allows for a shallow copy and not a deep copy.)
    
        GradeType "Text" doesn't have:
        - MaxPoints
        - ExcludeFromFinalGradeCalculation
        - PointsNumerator
        - PointsDenominator
        - WeightedDenominator
        - WeigthedNumerator
    
    category -- Template representing a valence category object (When you copy, use the extend helper function. Allows for a shallow copy and not a deep copy.)
    debugMode -- When equals true, the log function will output to the console.
*/

var async = require('async'),                               // Used to make valence requests happen in parallel. Also used to prevent code from happening before the desired moment.
    request = require('superagent'),                        // Required to make requests to valence.
    auth = require('superagent-d2l-session-auth'),          // Required to authorize useage of requests.
    query = require('query-string').parse(location.search), // Used to get information from the query string of the GET request. Only used for orgUnitId.
    data = {
        firstName: "",                                                                         // The first name of the user (student/teacher/teacher's aid/etc.) who is accessing the page. 
        lastName: "",                                                                          // The last name of the user (student/teacher/teacher's aid/etc.) who is accessing the page.
        orgUnitId: query.ou,                                                                   // The course's ID. NOTE: This code PROBABLY won't break, but it still could fail if the system were to drastically change.
        courseName: window.top.$('a[title][href="/d2l/home/' + query.ou + '"]').attr('title'), // The title of the course. BE AWARE! This code is NOT future-proof.
        grades: [],                                                                            // An array containing grade objects
        categories: [],                                                                        // An array containing category objects
        finalCalculatedGrade: null,                                                            // Representation of the final calculated grade object.
        dataIsSet: false                                                                       // Was the data already set before?
    },
    grade = {
        gradeID: "",                            // The ID of the grade object
        gradeName: "",                          // The name of the grade object
        gradeShortName: "",                     // The short version of the name of the grade object
        catID: "",                              // The ID of the category that the grade falls in. Should either equal 0 or a catID in a category in the data.categories array.
        maxPoints: null,                        // The maximum number of points that a grade can have.
        weight: null,                           // This is the percentage the grade contributes to the category or, if it doesn't have a category (i.e. catID == 0), final grade.
        excludeFromFinalGradeCalculation: null, // Do we exclude this item from the calculation of the final grade?
        pointsDenominator: null,                // Denominator of the points earned without weight
        pointsNumerator: null,                  // Numerator of the points earned without weight
        weightedDenominator: null,              // Denominator of the points earned with weight
        weightedNumerator: null,                // Numerator of the points earned with weight
        description: "",                        // The description of the grade
        gradeType: "",                           // The grade type. Options can be: "Numeric," "Selectbox," "Pass/Fail," "Formula," "Calculated," "Text"
        isGraded: false
    },
    category = {
        catName: "",                 // The full name of the category
        catID: "",                   // The ID of the category
        weight: null,                // This is the percentage the category contributes to the final grade.
        maxPoints: null,             // The maximum number of points allowed to earn in the category. *** HUH? ***
        excludeFromFinalGrade: null, // Do we exclude this item from the calculation of the final grade?
        
        /* Once a category has a grade, it too can have grade information */
        grade: null
    },
    debugMode = true,
    URL;

if (typeof data.courseName === "undefined" || typeof data.orgUnitId === "undefined") {
  URL = window.location.href;
  data.orgUnitId = URL.substring(URL.lastIndexOf('/')+1, URL.length);
  data.courseName = window.top.$('a[title][href="/d2l/home' + data.orgUnitId + '"]').attr('title');
}

/********************* HELPER FUNCTIONS *********************/

/**
 * LOG
 *   Writes to the console the message or the error message passed in.
 * Parameters:
 *   title: string - title of the log output
 *   err:   string - error message to output
 *   data:  string - message to output
 * Return:
 *   NOTHING
 **/
function log(title, err, data) {
    if (debugMode) {
        console.group("%c" + title + ':', 'color: blue; font-size: large');
        if (err) {
            console.log(err);
        } else {
            console.log(data.body);
        }
        console.groupEnd();
    }
}

/**
 * SEARCH_GRADES_BY_ID:
 *   Searches for a grade object in data which has a gradeId provided by the parameter.
 * Parameters:
 *   gradeId: int - the number representing the gradeID of the desired grade ID.
 * Return:
 *   Index of desired grade in data.grades 
 **/
function searchGradesById(gradeId) {
    for (var i = 0; i < data.grades.length; ++i) {
        if (data.grades[i].gradeID == gradeId) {
            return i;
        }
    }

    return null;
}

/**
 * SEARCH_CATEGORIES_BY_ID:
 *   Searches for a category object in data which has a categoryId provided by the parameter.
 * Parameters:
 *   catId: int - the number representing the catID of the desired category ID.
 * Return:
 *   Index of desired category in data.categories 
 **/
function searchCategoriesById(catId) {
    for (var i = 0; i < data.categories.length; ++i) {
        if (data.categories[i].catID == catId) {
            return i;
        }
    }

    return null;
}

/**
 * EXTEND:
 *   Mimics the functionality of jQuery's extend. Allows for shallow copies to be made.
 * Parameters:
 *   target:       object - the object that will be written to.
 *   objectToCopy: object - the object that will be copied.
 *
 * Return:
 *   target: object - the object that will be written to.
 **/
function extend(target, objectToCopy){
    for(var key in objectToCopy)
        if(objectToCopy.hasOwnProperty(key))
            target[key] = objectToCopy[key];
    return target;
}

/**
 * MAKE_DATA_WRAPPER:
 *    Returns an object that has functions to get information from the data object.
 * Parameters:
 *    NONE
 * Return:
 *    SEE DESCRIPTION
 **/
function makeDataWrapper() {
    return {
        getCourseName: function () {
            return data.courseName;
        },
        getCourseID: function () {
            return data.orgUnitId;
        },
        getFirstName: function () {
            return data.firstName;
        },
        getLastName: function () {
            return data.lastName;
        },
        getGrades: function () {
            return data.grades;
        },
        getCategories: function () {
            return data.categories;
        },
        getFinalCalculatedGrade: function() {
            return data.finalCalculatedGrade;
        }
    }
}

/********************* MAIN FUNCTION *********************/

/**
 * RUN
 *   This will proceed to make requests to valence and set data to the information gathered!
 * Parameters:
 *   callback: function - this is the function that will be called after the async requests are done.
 *               it takes two parameters: err and res. Both of which are objects.
 * RETURN:
 *   NOTHING
 **/
function run(callback) {
    /********************* END FUNCTION *********************/
    
    /**
     * FINALIZE:
     *    Callback function that async.parallel calls after all requests have been finished.
     * Parameters:
     *    err: object - The error information if there was an error with the requests.
     *    res: object - The result information if everything went smoothly.
     * Return:
     *    NOTHING
     **/
    function finalize(err, res) {
        var i,
            j;
        if (!err) {
            data.dataIsSet = true;
            
            for (i = 0; i < res.grades.length; ++i) {
                for (j = 0; j < res.categories.length; ++j) {
                    if (res.categories[j].catID === res.grades[i].catID) {
                        res.grades[i].catName = res.categories[j].catName;
                    }
                }
            }

            // All worked well and call the user's callback function.
            callback(null, makeDataWrapper());
        } else {
            callback(err, makeDataWrapper());
        }
    }
    
    /********************* ASYNC IN PARALLEL *********************/
    if (!data.dataIsSet) {
        async.parallel({
                /********************* VALENCE REQUESTS *********************/
                /* FIRST AND LAST NAME */
                whoAmI: function (asyncCallback) {
                    request
                        .get('/d2l/api/lp/1.5/users/whoami')
                        .use(auth)
                        .end(function (err, res) {
                            log('whoAmI', err, res);
                            
                            if (!err) {
                                var user = res.body;
                                data.firstName = user.FirstName;
                                data.lastName = user.LastName;

                                asyncCallback(null, {
                                    firstName: data.firstName,
                                    lastName: data.lastName
                                });
                            } else {
                                asyncCallback(null, null);
                            }
                        });
                },
                /* ALL GRADE OBJECTS AND GRADE VALUES */
                grades: function (asyncCallback) {
                    request
                        .get('/d2l/api/le/1.5/' + data.orgUnitId + '/grades/')
                        .use(auth)
                        .end(function (err, res) {
                            log('all grades', err, res);

                            if (!err) {
                                var grades = res.body;

                                // Gather information from all grade objects
                                for (var i = 0; i < grades.length; ++i) {
                                    data.grades[i] = extend({}, grade);

                                    data.grades[i].excludeFromFinalGradeCalculation = grades[i].ExcludeFromFinalGradeCalculation;
                                    data.grades[i].maxPoints                        = grades[i].MaxPoints;
                                    data.grades[i].gradeName                        = grades[i].Name;
                                    data.grades[i].gradeShortName                   = grades[i].ShortName;
                                    data.grades[i].gradeID                          = grades[i].Id;
                                    data.grades[i].catID                            = grades[i].CategoryId;
                                    data.grades[i].weight                           = grades[i].Weight;
                                    data.grades[i].description                      = grades[i].Description;
                                    data.grades[i].gradeType                        = grades[i].GradeType;
                                }

                                request
                                    .get('/d2l/api/le/1.5/' + data.orgUnitId + '/grades/values/myGradeValues/')
                                    .use(auth)
                                    .end(function (err, res) {
                                        log('grades', err, res);
                                        
                                        if (!err) {
                                            var grades = res.body;

                                            // Gather more information about the grade objects that have grade values
                                            for (var i = 0; i < grades.length; ++i) {
                                                var index = searchGradesById(grades[i].GradeObjectIdentifier);

                                                if (index !== null) {
                                                    data.grades[index].pointsDenominator   = grades[i].PointsDenominator;
                                                    data.grades[index].pointsNumerator     = grades[i].PointsNumerator;
                                                    data.grades[index].weightedDenominator = grades[i].WeightedDenominator;
                                                    data.grades[index].weightedNumerator   = grades[i].WeightedNumerator;
                                                    data.grades[index].isGraded            = true;
                                                } else {
                                                    index = searchCategoriesById(grades[i].GradeObjectIdentifier);
                                                    
                                                    if (index !== null) {
                                                        data.categories[index].grade = extend({}, grade);
                                                        
                                                        data.categories[index].grade.catID                            = grades[i].GradeObjectIdentifier;
                                                        data.categories[index].grade.gradeType                        = grades[i].GradeObjectTypeName;
                                                        data.categories[index].grade.gradeID                          = grades[i].GradeObjectIdentifier;
                                                        data.categories[index].grade.gradeName                        = grades[i].GradeObjectName;
                                                        data.categories[index].grade.pointsDenominator                = grades[i].PointsDenominator;
                                                        data.categories[index].grade.pointsNumerator                  = grades[i].PointsNumerator;
                                                        data.categories[index].grade.weightedDenominator              = grades[i].WeightedDenominator;
                                                        data.categories[index].grade.weightedNumerator                = grades[i].WeightedNumerator;
                                                        data.categories[index].grade.excludeFromFinalGradeCalculation = data.categories[index].excludeFromFinalGrade;
                                                        data.categories[index].grade.weight                           = data.categories[index].weight;
                                                        data.categories[index].grade.maxPoints                        = data.categories[index].maxPoints;
                                                        data.categories[index].grade.isGraded                         = true;
                                                        /* Only missing the description. Categories don't have descriptions, so that's okay. */
                                                    }
                                                }
                                            }

                                            asyncCallback(null, data.grades);
                                        } else {
                                            asyncCallback(null, []);
                                        }
                                    });
                            } else {
                                asyncCallback(null, null);
                            }
                        });
                },
                /* CATEGORIES */
                categories: function (asyncCallback) {
                    request
                        .get('/d2l/api/le/1.5/' + data.orgUnitId + '/grades/categories/')
                        .use(auth)
                        .end(function (err, res) {
                            log('categories', err, res);

                            if (!err) {
                                var cats = res.body;

                                // Gather each category's information
                                for (var i = 0; i < cats.length; ++i) {
                                    data.categories[i] = extend({}, category);
                                    
                                    data.categories[i].catName               = cats[i].Name;
                                    data.categories[i].catID                 = cats[i].Id;
                                    data.categories[i].excludeFromFinalGrade = cats[i].ExcludeFromFinalGrade;
                                    data.categories[i].maxPoints             = cats[i].MaxPoints;
                                    data.categories[i].weight                = cats[i].Weight;
                                }
                            
                                asyncCallback(null, data.categories);
                            } else {
                                asyncCallback(null, null);
                            }
                        });
                },
                finalCalculatedGrade: function (asynCallback) {
                    request
                        .get('/d2l/api/le/1.5/' + data.orgUnitId + '/grades/final/values/myGradeValue')
                        .use(auth)
                        .end(function (err, res) {
                            log('final calculated grade', err, res);
                        
                            if (!err) {
                                var finalCalculatedGrade = res.body;
                                
                                data.finalCalculatedGrade = extend({}, grade);
                                
                                data.finalCalculatedGrade.pointsDenominator   = finalCalculatedGrade.PointsDenominator;
                                data.finalCalculatedGrade.pointsNumerator     = finalCalculatedGrade.PointsNumerator;
                                data.finalCalculatedGrade.weightedNumerator   = finalCalculatedGrade.WeightedNumerator;
                                data.finalCalculatedGrade.weightedDenominator = finalCalculatedGrade.WeightedDenominator;
                                data.finalCalculatedGrade.gradeID             = finalCalculatedGrade.GradeObjectIdentifier;
                                data.finalCalculatedGrade.gradeName           = finalCalculatedGrade.GradeObjectName;       
                                
                                asynCallback(null, data.finalCalculatedGrade);
                            } else if (res.statusCode === 404) {
                                data.finalCalculatedGrade = {
                                    gradeID: "Final",
                                    gradeName: "Final Calculated Grade",
                                    catID: "",
                                    maxPoints: null,
                                    weight: null,
                                    excludeFromFinalGradeCalculation: null,
                                    pointsDenominator: 100,
                                    pointsNumerator: 100,
                                    weightedDenominator: 100,
                                    weightedNumerator: 100,
                                    description: "Final Calculated Grade",
                                    gradeType: "Final Calculated Grade",
                                    isGraded: true
                                };
                                asynCallback(null, data.finalCalculatedGrade);
                            } else {
                                asynCallback(err, null);
                            }
                        });
                }
            }, finalize);
    } else {
        // Data has already been set
        callback(null, makeDataWrapper())
    }
}

return {
    run: run
};
}());