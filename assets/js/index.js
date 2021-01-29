import * as puzzlePlay from "./puzzlePlay.js";

window.addEventListener('load', () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (isAuthenticated === "true") {
        loadLoggedInContent();
        setTimeout(() => {
            welcomeUser();
            logOutUser();
        }, 300);
    } else {
        loadLoggedOutContent();
    }
});

setTimeout(() => {
    document.querySelectorAll('.category').forEach(item => {
        item.addEventListener('click', event => {
            const categoriesElements = document.querySelector("#categories");
            const category = puzzlePlay.splitAndJoinCategory(event.target.getAttribute("name"));
            const difficultySelected = event.target.parentElement.querySelector(".difficulty > .uk-active");
            const wordsAndSettings = puzzlePlay.puzzleWordsAndSettings(category, difficultySelected.innerText);
            puzzlePlay.playPuzzleGame(wordsAndSettings);
            removeElements(categoriesElements);

        });
    });
}, 300);

const loadLoggedInContent = () => {
    $("#app-root").load("gamepage.html");
    displayLeaderBoardContent();
    setTimeout(() => {
        getResolution();
        disableDifficulty();
    }, 500);

}

const loadLoggedOutContent = () => {
    $("#app-root").load("homepage.html");
}

const disableDifficulty = () => {
    const screenSize = localStorage.getItem("screenSize");
    const categories = document.querySelector("#categories");
    const disableDifficulty = categories.querySelectorAll(".difficulty li");
    if (screenSize === "small") {
        disableDifficulty.forEach((item) => {
            if (item.innerText === "MEDIUM") {
                item.classList.add("uk-disabled")

            } else if (item.innerText === "HARD") {
                item.classList.add("uk-disabled")
            }
        })
    } else if (screenSize === "medium") {
        disableDifficulty.forEach((item) => {
            if (item.innerText === "MEDIUM") {
                item.classList.add("uk-disabled")

            } else if (item.innerText === "HARD") {
                item.classList.add("uk-disabled")
            }
        })

    } else {
        disableDifficulty.forEach((item) => {
            item.classList.remove("uk-disabled");
        });
    }
}

function getResolution() {
    const username = localStorage.getItem("firstname");
    if (window.outerWidth < 600) {
        localStorage.setItem("screenSize", "small");
        UIkit.modal.alert(`Hello ${username}, due to the screen size Medium and Hard difficulties has been disabled.`).then(function () {
        });
    } else if (window.outerWidth >= 601 && window.outerWidth <= 765) {
        localStorage.setItem("screenSize", "medium");
        UIkit.modal.alert(`Hello ${username}, due to the screen size Hard difficulties has been disabled.`).then(function () {
        });
        if (localStorage.getItem("screenSize")) {
            localStorage.removeItem("screenSize");
        }
    }
}

const logOutUser = () => {
    const logOutButton = document.querySelector("#logOut");
    if (logOutButton !== null) {
        logOutButton.addEventListener("click", () => {
            localStorage.setItem("isAuthenticated", false);
            const logOut = localStorage.getItem("isAuthenticated")
            if (logOut === "false") {
                location.reload();
            }
        });
    }
}

const removeElements = (categoriesElements) => {
    while (categoriesElements.firstChild) {
        categoriesElements.removeChild(categoriesElements.lastChild);
    }
}

const welcomeUser = () => {
    const welcomeUser = document.querySelector("#welcomeUser");
    const userFirstName = localStorage.getItem("firstname");
    const capitalizedName = capitalizeFirstLetter(userFirstName);
    if (!(welcomeUser === null)) {
        welcomeUser.textContent = capitalizedName;
    }
}

const capitalizeFirstLetter = (firstName) => {
    const splitWords = firstName.toLowerCase().split(" ");
    const capitalizedName = splitWords.map((word) => {
        return word[0].toUpperCase() + word.substring(1);
    }).join(" ");
    return capitalizedName;
}

const getLeaderBoardContent = async () => {
    const response = puzzlePlay.getUsersLeaderboards();
    const allUserPerformance = await response.then((user) => {
        let userLeaderboards = user.map((user) => {
            return { username: user.username, leaderboard: user.leaderboards }
        }).map((user) => {
            let addedLeaderBoardPerUser = {
                user: user.username,

                score: user.leaderboard.map((item) => {
                    return item.score;
                }).reduce((acc, result) => { return acc + result }),

                time: user.leaderboard.map((item) => {
                    return item.time;
                }).reduce((acc, result) => { return acc + result }),

                category: user.leaderboard.map((item) => {
                    return item.category;
                }).reduce((acc, result) => {
                    return acc.includes(result) ? acc : acc + ", " + result
                })
            };
            return addedLeaderBoardPerUser
        })
        return userLeaderboards;
    });
    return allUserPerformance;
}

const displayLeaderBoardContent = () => {
    const leaderboardsByUser = getLeaderBoardContent();
    leaderboardsByUser.then((element) => {
        element.sort((a, b) => (a.score < b.score) ? 1 : -1)
        element.map((element) => {
            const played = calculatePlayedSeconds(element.time);
            $("#dashboardModal tbody").append(
                "<tr>" +
                "<td>" + element.user + "</td>" +
                "<td>" + element.score + "</td>" +
                "<td>" + `${played.hours}:${played.minutes}:${played.seconds}` + "</td>" +
                "<td>" + element.category + "</td>"
                + "</tr>"
            );
        })
    })
}

const calculatePlayedSeconds = (element) => {
    const hours = splitTimeValues(Math.floor(element / 60 / 60))
    const minutes = splitTimeValues(Math.floor(element / 60) - (hours * 60));
    const seconds = splitTimeValues(element % 60);
    return { hours: hours, minutes: minutes, seconds: seconds }
}

const splitTimeValues = (value) => {
    let valueString = value + "";
    if (valueString.length < 2) {
        return "0" + valueString;
    } else {
        return valueString;
    }

}