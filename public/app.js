const auth = firebase.auth();

const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const profileBtn = document.getElementById("profile");

const provider = new firebase.auth.GoogleAuthProvider();

const db = firebase.firestore();

let thingsRef;
let unsubscribe;

function clickLogin(){
    auth.signInWithPopup(provider);
}

function clickLogout(){
    auth.signOut();
}

function updateChart(){
    var newData = [parseInt(numCorrect), parseInt(numWrong)];
    myChart.data.datasets[0].data = (newData);
    myChart.update();
}

function checkAnswer(){
    document.getElementById("solutionButton").style.pointerEvents = "auto";
    document.getElementById("checkButton").style.pointerEvents = "none";

    if(board.fen() === solutionBoard.fen()){
        numCorrect++;
        numStreak++;
        document.getElementById("correctText").innerHTML = numCorrect;
        document.getElementById("streakText").innerHTML = numStreak;

        if(firebase.auth().currentUser){
            thingsRef = db.collection('users');

            var userString = firebase.auth().currentUser.uid + "";

            thingsRef
                .where('user', '==', firebase.auth().currentUser.uid)
                .onSnapshot(snapshot => {
                        if(snapshot.exists){
                            thingsRef.doc(userString).update({
                                user: firebase.auth().currentUser.uid,
                                correct: numCorrect,
                                wrong: numWrong,
                                streak: highestStreak
                            })
                        }
                        else{
                            thingsRef.doc(userString).set({
                                user: firebase.auth().currentUser.uid,
                                correct: numCorrect,
                                wrong: numWrong,
                                streak: highestStreak
                            });
                        }
                })
        }
        else{
            unsubscribe && unsubscribe();
        }
    }
    else{
        numWrong++;
        numStreak = 0;
        document.getElementById("wrongText").innerHTML = numWrong;
        document.getElementById("streakText").innerHTML = numStreak;

        if(firebase.auth().currentUser){
            thingsRef = db.collection('users');
            
            var userString = firebase.auth().currentUser.uid + "";

            thingsRef
                .where('user', '==', firebase.auth().currentUser.uid)
                .onSnapshot(snapshot => {
                        if(snapshot.exists){
                            thingsRef.doc(userString).update({
                                user: firebase.auth().currentUser.uid,
                                correct: numCorrect,
                                wrong: numWrong,
                                streak: highestStreak
                            })
                        }
                        else{
                            thingsRef.doc(userString).set({
                                user: firebase.auth().currentUser.uid,
                                correct: numCorrect,
                                wrong: numWrong,
                                streak: highestStreak
                            });
                        }
                })
        }
        else{
            unsubscribe && unsubscribe();
        }
        howClose();

        if(!($("#howCloseCheckbox").is(":checked"))){
            document.getElementById("howCloseText").innerHTML = "You were " + numOff + " pieces off.";
            $('#howCloseModal').modal('toggle');
        }
    }
    updateChart();
}

auth.onAuthStateChanged(user =>{
    if(user){
        signInBtn.style.display = "none";
        signOutBtn.style.display = "block";
        profileBtn.style.display = "block";

        thingsRef = db.collection('users');

        var userString = firebase.auth().currentUser.uid + "";
        thingsRef.doc(userString).get().then(function(doc){
            if(doc.exists){
                numCorrect = parseInt(doc.data().correct);
                numWrong = parseInt(doc.data().wrong);
                highestStreak = parseInt(doc.data().streak);
                
                document.getElementById("correctText").innerHTML = numCorrect;
                document.getElementById("wrongText").innerHTML = numWrong;
                updateChart();
            }
        })

        document.getElementById("profileText").innerHTML = "Your highest streak is " + highestStreak + ".";
    }
    else{
        unsubscribe && unsubscribe();
        signOutBtn.style.display = "none";
        profileBtn.style.display = "none";
        signInBtn.style.display = "block";

        numCorrect = 0;
        numWrong = 0;
        numStreak = 0;

        document.getElementById("correctText").innerHTML = numCorrect;
        document.getElementById("wrongText").innerHTML = numWrong;
        document.getElementById("streakText").innerHTML = numStreak;
    }
})


function darkMode(){
    var element = document.body;
    element.classList.toggle("theme-switch");
}

const chess = new Chess();

var config = {
    draggable: true,
    dropOffBoard: 'trash',
    sparePieces: true
}

var board = Chessboard('startBoard', 'clear');

var solutionBoard = Chessboard('solveBoard', config);

var games = [
    "br3r1k/p5b1/8/1p2pPB1/2p5/P6P/2B3PK/1R3N2",
    "br1q1rk1/p3p1bp/6p1/1p1n2B1/2pPB3/P1P4P/2Q2PP1/1R1R1NK1",
    "r3r3/1p1n2bk/1n1pb1pp/pPp2p2/P1P1P2q/R3BN1P/5PP1/1NQ1RBK1",
    "7q/pppb1pk1/3p1ppr/2bPpP2/2B1P1Q1/2P2N2/P5PP/4R2K",
    "2k5/p1q1bp2/Q1p1p2p/4P1pP/6P1/P7/KPP2P2/3R4",
    "2r1r1k1/2p3pp/1pb5/2p1b1P1/5B2/p1P2PKP/PP1R4/2N2R2",
    "6kr/pp4p1/1b4q1/1Pp1p3/2PnP3/4B1Pp/P6P/RQ4K1",
    "8/3n1Bpk/r2b3p/2p5/2R3PP/4B3/1PK2P2/8",
    "2R5/4rk1p/1p1ppb2/1P2Np2/1P2n1p1/4P1P1/rB3P1P/3RN1K1",
    "3r2k1/p5pp/3N1n2/4p3/N2n4/Pr1p2PP/1P3PK1/3R1R2",
    "4r1k1/p1pr2pp/1n1qNp2/3p1P2/3R4/1P5P/P4QP1/5R1K",
    "2r2rk1/1q1nbpp1/ppb2n1p/4N3/1PPR1B2/P1N4P/2Q1BPP1/3R2K1",
    "5r1k/1p1n3p/2NP1b2/6q1/5pp1/B7/5pPP/1R1QR1K1",
    "4r2k/p6p/4PP2/6q1/2p4P/3p4/P5R1/7K",
    "8/5p1p/8/3bkp1N/3n4/3K4/1P6/2R5",
    "8/6pk/2b2p2/1nP2N1p/4P3/5PBP/6PK/8",
    "8/p1RR1ppk/1p2p2p/8/8/1P4P1/P3qP1P/6K1",
    "1r2r1k1/1ppnqpbp/p2p1np1/8/2P5/1PN3P1/PBQ1PPBP/2R2RK1",
    "2r3k1/3b1pp1/3B3p/2p5/p3R3/P2P2P1/2P4P/6K1",
    "r1b1r1k1/1pq2pp1/p1p2nnp/P2pp3/4P3/2PP1NPP/1PQ2PB1/R3RNK1",
    "2k1rbnr/pp4pp/2n5/2p5/2N1p3/5P2/PPN2KPP/R1B4R",
    "r4rk1/b1p1qppp/p1pp1n2/8/1PP5/P1N1P1P1/1B3P1P/R2Q1RK1",
    "rn1qk2r/pbpp1ppp/1p2pn2/8/1bPPP3/2NB4/PPQ2PPP/R1B1K1NR",
    "r2qk3/pb3p2/4pr2/1ppP4/2p5/2N2nP1/PP1Q1PBP/R4RK1",
    "r1bq1rk1/pp2ppbp/1n4p1/n2P4/8/1BN1BN2/PP3PPP/R2Q1RK1",
    "8/1p1r2p1/p2b1kp1/2Bppb2/1P3n2/8/1P3PPP/R1R2BK1",
    "r4rk1/1qRb3p/p2p1n2/1p1Pp1p1/4PpP1/P4P1P/1PQB4/2R2BK1",
    "8/1pp1p1k1/3r1bp1/p2R2p1/P1K5/2P4P/1P3PP1/2B5",
    "r2q1rk1/p3bppp/2np1n2/2p3N1/1p2PBb1/3B2N1/PPP2PPP/R2Q1RK1",
    "N1bkr3/p2p1pbp/2nn2q1/2K3p1/Q2P1p2/2P2N2/PP4PP/R1B2B1R",
    "1r1q1rk1/p4p1p/n4bp1/P1p1p3/2P5/2P2NP1/4QPBP/R4RK1",
    "8/8/5p1k/4q2p/P4p1P/5P2/3Q3K/8",
    "4rr1k/1ppb2p1/1p3nqp/3Ppp2/8/1B1P2NP/PP3QP1/R4RK1",
    "3r4/8/5bk1/1Pnbp2p/R1N4P/2P3B1/7K/4N3",
    "6r1/4b2k/2b1npq1/1p2p2p/nPp1P1PP/2P1B1PN/6NK/1BQ3R1",
    "r1b2rk1/p3bppp/q1pp1n2/2p1p3/4PP2/2NPB2P/PPPN2P1/1R1Q1RK1",
    "2b3k1/r3bqpr/2p1p1Q1/2p1Pp2/NpPp1P2/1P1P1N2/P5RP/6RK",
    "3b1k2/q3r1pp/3NRp2/3Pp3/p3P3/5Q1P/2P2PP1/6K1",
    "r1b1r3/ppp3pk/2nN1q1p/5p2/4P1n1/1QPP4/PP1BB1PP/RN2K2R",
    "8/8/1ppbbkpp/p1n1p3/2P1P1P1/1PBN1K1P/P7/5B2",
    "rr4k1/p4pbp/2pq1np1/3pn3/8/1QN1P2P/PP2BPP1/R1B2RK1",
    "4rk1r/ppp2p2/2n4p/3p1Pq1/3P2p1/2PB1pPb/PP3K1P/R1Q2N1R",
    "3rr1k1/1p2qppp/p1p5/4p3/4P3/P2R4/1PPQ1PPP/3R2K1",
    "r1bq1rk1/pp2n1bp/2p2pp1/3p2B1/4P3/2PB1N2/PP3PPP/R2QR1K1",
    "8/1K3k2/p4p2/P3p2P/3nP1P1/5P2/3B4/8",
    "8/8/2p5/7p/8/4k2r/2P5/3K1R2",
    "5r2/1p6/2p1k2p/3p2p1/1P1KPr2/1R3PRP/2P5/8",
    "r1q2rk1/p3bppb/3p1n1p/1pnPp3/4P1P1/2N3NP/PP2QPB1/R1B1K2R",
    "3r4/1r5p/3pk1p1/p1p5/P1P1P3/2K4P/3R2P1/3R4",
    "r6b/3r3p/1n1pk1p1/pNp1n3/P3P3/1PB4P/1N2K1P1/1R1R4",
    "3rr1k1/5qbp/1Np1b3/p1Ppp1p1/4np2/BP5P/P3BPP1/1RQ2RK1",
    "4rk2/pp1R2pp/2p1n2r/4Pq2/2B1R3/5P1P/PP1Q2PK/8",
    "r1r5/pq1bpnkp/1p1p2p1/3P4/3B1P2/1P5P/P2QB1P1/2R2RK1",
    "2r2r2/6k1/p2R1np1/1p2p3/6N1/1Pn4P/P1P3B1/2R3K1",
    "2nr4/1p1r1pkp/4p1p1/2q5/2Pp4/1P3B1P/P2RQPP1/3R2K1"
];

var numCorrect = 0;
var numWrong = 0;
var numStreak = 0;
var numOff = 0;
var highestStreak = 0;

var interval = 1000; // ms
var expected = Date.now() + interval;
setTimeout(step, interval);

var startTime = 60;
var oldStartTime = 0;
var timerIsRunning = false;

var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Right', 'Wrong'],
        datasets: [{
            label: '# of Votes',
            data: [0, 0],
            backgroundColor: [
                '#4CAF50',
                'red'
            ]
        }]
    }
});

function runTimer(){
    document.getElementById("startButton").style.display = "none";
    document.getElementById("timer").style.pointerEvents = "none";
    timerIsRunning = true; 
    var game = games[Math.floor(Math.random() * games.length)];

    board.position(game);
}

function thirtyTimer(){
    startTime = 30;
    changeTimer();
}

function sixtyTimer(){
    startTime = 60;
    changeTimer();
}

function oneTwentyTimer(){
    startTime = 120;
    changeTimer();
}

function threeHundredTimer(){
    startTime = 300;
    changeTimer();
}

function sixHundredTimer(){
    startTime = 600;
    changeTimer();
}

function customSetTimer(){
    startTime = $("#timerMessageText").val();
    if(isNaN(startTime) || startTime < 0){
        alert("Not a valid number. Try again");
    }
    else{
        changeTimer();
    }
}

function changeTimer(){
    oldStartTime = startTime;
    if(startTime != null){
        if(startTime < 10){
            document.getElementById("timer").innerHTML = "00:0" + startTime;
        }
        else if(startTime >= 60){
            var min = Math.floor(startTime / 60);
            var seconds = startTime % 60;

            if(min >= 10){
            if(seconds < 10){
                document.getElementById("timer").innerHTML = min + ":0" + seconds;
            }
            else{
                document.getElementById("timer").innerHTML = min + ":" + seconds;
            }
            }
            else if(seconds < 10){
            document.getElementById("timer").innerHTML = "0" + min + ":0" + seconds;
            }
            else{
            document.getElementById("timer").innerHTML = "0" + min + ":" + seconds;
            }
        }
        else{
            document.getElementById("timer").innerHTML = "00:" + startTime;
        }
    }
}

function howClose(){
    if(board.fen() === solutionBoard.fen()){
        
    }
    else{
        var correctArr = board.fen().split("/");
        var guessArr = solutionBoard.fen().split("/");

        for(var i = 0; i < correctArr.length; i++){
            if(correctArr[i] === guessArr[i]){

            }
            else{
                var correctStr = correctArr[i];
                var guessStr = guessArr[i];

                var correctPieceStr = "";
                var guessPieceStr = "";

                for(var j = 0; j < correctStr.length; j++){
                    var c = correctStr.charAt(j);
                    if(isNaN(c)){
                        correctPieceStr += c;
                    }

                    else{
                        for(var k = 0; k < c; k++){
                            correctPieceStr += "_";
                        }
                    }
                }

                for(var l = 0; l < guessStr.length; l++){
                    var c = guessStr.charAt(l);
                    if(isNaN(c)){
                        guessPieceStr += c;
                    }

                    else{
                        for(var m = 0; m < c; m++){
                            guessPieceStr += "_";
                        }
                    }
                }

                for(var n = 0; n < 8; n++){
                    if(!(guessPieceStr.charAt(n) === correctPieceStr.charAt(n))){
                        numOff++;
                    }
                }
            }
        }
    }
}

function showSolution(){
    document.getElementById("startBoard").style.display= "block";
    document.getElementById("solveBoard").style.display = "none";	
}

function resetBoard(){
    numOff = 0;
    board.clear();
    solutionBoard.clear();
    document.getElementById("startBoard").style.display= "block";
    document.getElementById("solveBoard").style.display = "none";	

    document.getElementById("startButton").style.display = "block";
    document.getElementById("timer").style.pointerEvents = "auto";

    document.getElementById("timer").style.display = "block"; 
    document.getElementById("solveDiv").style.display = "none";  
    document.getElementById("solutionButton").style.pointerEvents = "none";
    document.getElementById("checkButton").style.pointerEvents = "auto";

    if(oldStartTime < 10){
        document.getElementById("timer").innerHTML = "00:0" + oldStartTime;
    }
    else if(oldStartTime >= 60){
        var min = Math.floor(oldStartTime / 60);
        var seconds = oldStartTime % 60;
        if(min >= 10){
        if(seconds < 10){
            document.getElementById("timer").innerHTML = min + ":0" + seconds;
        }
        else{
            document.getElementById("timer").innerHTML = min + ":" + seconds;
        }
        }
        else if(seconds < 10){
            document.getElementById("timer").innerHTML = "0" + min + ":0" + seconds;
        }
        else{
        document.getElementById("timer").innerHTML = "0" + min + ":" + seconds;
        }

    }
    else{
        document.getElementById("timer").innerHTML = "00:" + oldStartTime;
    }
}

function step() {
    var dt = Date.now() - expected; // the drift (positive for overshooting)
    if (dt > interval) {
        // something really bad happened. Maybe the browser (tab) was inactive?
        // possibly special handling to avoid futile "catch up" run
    }

    if(timerIsRunning){
        if(startTime < 0){
        document.getElementById("startBoard").style.display= "none";
        document.getElementById("solveBoard").style.display = "block";	

        document.getElementById("timer").style.display = "none"; 
        document.getElementById("solveDiv").style.display = "block";  

        timerIsRunning = false;  
        startTime = oldStartTime;  
        }
        else{
        if(startTime < 10){
            document.getElementById("timer").innerHTML = "00:0" + startTime;
        }
        else if(startTime >= 60){
            var min = Math.floor(startTime / 60);
            var seconds = startTime % 60;
            if(min >= 10){
            if(seconds < 10){
                document.getElementById("timer").innerHTML = min + ":0" + seconds;
            }
            else{
                document.getElementById("timer").innerHTML = min + ":" + seconds;
            }
            }
            else if(seconds < 10){
                document.getElementById("timer").innerHTML = "0" + min + ":0" + seconds;
            }
            else{
            document.getElementById("timer").innerHTML = "0" + min + ":" + seconds;
            }

        }
        else{
            document.getElementById("timer").innerHTML = "00:" + startTime;
        }
        startTime--;
        }
    }

    expected += interval;
    setTimeout(step, Math.max(0, interval - dt)); // take into account drift
}