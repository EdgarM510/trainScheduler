let config = {
  apiKey: "AIzaSyCCMTvz5zud8S2uhfENn2TA_DwnzkmPTxo",
  authDomain: "denshasolutions.firebaseapp.com",
  databaseURL: "https://denshasolutions.firebaseio.com",
  projectId: "denshasolutions",
  storageBucket: "denshasolutions.appspot.com",
  messagingSenderId: "500363251448"
};
firebase.initializeApp(config);

  
  let db = firebase.database();
  
  $("#clear-data").on("click", function(event) {
    event.preventDefault();
    db.ref().remove();
    $("#table").html(`<tr>
    <th>Train Name</th>
    <th>Destination</th>
    <th>Frequency (min)</th>
    <th>Next Arrival</th>
    <th>Minutes Away</th>
    <th>Edit</th>
    </tr>`);
  });
  
$("#add-train").on("click", function(event) {
event.preventDefault();
  
  let name = "";
  let destination = "";
  let firstTrain = null;
  let frequency = 0;

  name = $('#name-input').val().trim();
  destination = $('#destination-input').val().trim();
  let today = moment().format("LL");
  firstTrain = today + " " + $('#firstTrain-input').val().trim();
  frequency = $('#frequency-input').val().trim();
  
  db.ref().push({
    name:   name,
    destination:   destination,
    firstTrain:   firstTrain,
    frequency:   frequency
  });  
});
  
      // Firebase watcher + initial loader HINT: .on("value")
  db.ref().on("child_added", function(childSnapshot){
    console.log("current child key", childSnapshot.key);
    console.log(childSnapshot.val());

    let minutesAway = null;
    let nextArrival = null;
    let initialTrain = moment(childSnapshot.val().firstTrain).format("HH:mm");

    if (moment().diff(moment(childSnapshot.val().firstTrain), "minutes") > 0){
      minutesAway = childSnapshot.val().frequency - (moment().diff(moment(childSnapshot.val().firstTrain), "minutes") % childSnapshot.val().frequency);
      nextArrival = moment().add(minutesAway, 'minutes').format("HH:mm");
    }
    else{
      minutesAway = moment(childSnapshot.val().firstTrain).diff(moment(), "minutes");
      nextArrival = initialTrain;
    }

    let rmvBtn = $('<button>');
    rmvBtn.text("Delete");
    rmvBtn.attr({
      "data-key": childSnapshot.key,
      "class": "rmvBtn"
    });

    let updtBtn = $('<button>');
    updtBtn.text("Update");
    updtBtn.attr({
      "data-key": childSnapshot.key,
      "class": "updtBtn"
    });


    let newtr = $(`<tr id="${childSnapshot.key}">
                      <td>${childSnapshot.val().name}</td>
                      <td>${childSnapshot.val().destination}</td>
                      <td>${childSnapshot.val().frequency}</td>
                      <td>${nextArrival}</td>
                      <td>${minutesAway}</td>
                      <td class="${childSnapshot.key}"></td>
                  </tr>`);
    $("#table").append(newtr);
    let putBtn = "." + childSnapshot.key;
    $(putBtn).append(rmvBtn);
    $(putBtn).append(updtBtn);

    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
      
  });

  $(document.body).on("click", ".rmvBtn", function(){
    let id = "#" + $(this).attr("data-key");
    $(id).remove();
    db.ref().child($(this).attr("data-key")).remove();
  });

  $(document.body).on("click", ".updtBtn", function(event) {
    event.preventDefault();

      let name = "";
      let destination = "";
      let firstTrain = null;
      let frequency = 0;
    
      name = $('#name-input').val().trim();
      destination = $('#destination-input').val().trim();
      let today = moment().format("LL");
      firstTrain = today + " " + $('#firstTrain-input').val().trim();
      frequency = $('#frequency-input').val().trim();
      
      if(name == ""||destination == ""||frequency == ""){
        alert("input values to update below");
      }
      else{
        db.ref().child($(this).attr("data-key")).update({
          name:   name,
          destination:   destination,
          firstTrain:   firstTrain,
          frequency:   frequency
        });
        location.reload();
      }
    });