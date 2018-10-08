//popover complete is still somewhat buggy
// requires 2 clicks to initialize popover after initial popover

//hide popover when clicking outside of the popover


//global variable to determine if user is dragging
var dragging = false;

//e.target -object that is clicked on
//popoverElement - event that contains the popover
$('html').on('click', function (e) {
  console.log(e.target);
  console.log(popoverElement);



  //if object clicked is not the popover object hide the popover
  //if the popover itself is clicked on do not close the popover
  if (!(popoverElement).is(e.target) &&
      popoverElement.has(e.target).length === 0 &&
      $('.popover').has(e.target).length === 0){
        popoverElement.popover('hide'); 
  }

  
});



allEvents = []; 

$(document).ready(function() {


  $(function(){
    $('#datetimepicker1').datetimepicker();
    
    
  });
  
  $("#datetimepicker1").on("dp.change", function() { 
    $("#datetimepicker1").data("DateTimePicker").hide(); 
  });




    // var date_input=$('input[name="date"]'); //our date input has the name "date"
    // var options={
    //   format: 'mm/dd/yyyy',
    //   todayHighlight: true,
    //   autoclose: true,
    // };
    // date_input.datepicker(options);

    var popTemplate = [
      '<div tabindex="0" class="popover" style="max-width:600px;">',
      '<div class="arrow"></div>',
      '<div class="popover-content"></div>',
      '<label>you</label>',
      '<span class="popOptions">',
      '<button class="fileContainer">',
      'Add Files',
      '<input type="file"/>',
      '</button>',
      '<button class="editTask">Edit</button>',
      '<div class="circle-loader">',
      '<div class = "checkmarkoverlay"></div>',
      '<div class="checkmark draw"></div>',
      '</div></span>',
      //  '<div id="toggle" class="circle-loader" onclick="checkTask()"><div class="checkmark draw" ></div></div><div id="showCompleted">Completed</div>',
       '</div>'].join('');

    //Modal start appears when adding task//
    $("#add").click(function(){
        $("#myModal").modal();
     
    });




    $(document).on('mouseenter', '.task-drag', function(){
      $(this).find("#removeBin").css('visibility', 'visible');
      
    });

    $(document).on('mouseleave', '.task-drag', function(){
      $(this).find("#removeBin").css('visibility', 'hidden');
      
    });

    $(document).on('click', '#removeBin', function(){
      $(this).parent().remove();

      let description = $(this).parent()[0].innerText;
      for (var i = 0; i < allEvents.length; i++) {
          if (description == allEvents[i].name) {
              allEvents.splice(i, 1);
          }
      }
     $.ajax(
      {
        url: "http://localhost:3000/delete_task",
        async: true,
        type: "POST",
        data: {descript: description},
        success: function (result) {
        console.log("successfully deleted");
        }
      });
    });

    $(document).on('click', '.editTask', function(){
      $('.popover').popover('hide');
      $("#editModal").modal();
     
      $('#editName').val(element.title);
      //Add the rest of the task options eg. duration,priority, Due Date

    });
    



    $(document).on('click', '.circle-loader', function(){
      $(this).toggleClass('load-complete');
      $(this).find(".checkmark").toggle('fast',taskCompleted());
    });

    
    

    //This needs to be checked every time a task is added into the calendar
    $(function() {
    $(".CreateButton").click(function() {
      if (validateForm()) {

          taskName = $('#tName').val();
          dury = $('#dury').val();
          category = $("#category").val();
          $('#myModal').modal('hide')
          $("#list").append("<div class='task-drag'><label>" + taskName + "</label><img src='../rubbish-bin.png'  id='removeBin' ></div>");
          $('#tName').val('');
          $('#hiddenText').hide();

          newTask = {name: taskName, duration: dury, category: category};
          allEvents.push(newTask);
          $.ajax(
              {
                  url: "http://localhost:3000/new_task",
                  async: true,
                  type: "POST",
                  data: newTask,
                  success: function (result) {
                      console.log("successfully added");
                  }
              });
      }

      $("#task-list .task-drag" ).each(function() {

        //name = "Hey";
        name2 = $(this).text(); 
        time = "04:00:00";
        colour = "grey"; 

        var arrayLength = allEvents.length;
        for (var i = 0; i < arrayLength; i++) {
          if(name2 == allEvents[i].name){
           time = "0"+allEvents[i].duration + ":00:00";
           category = allEvents[i].category;

           if (category == "University"){
            colour = "Blue";
           }
           else if(category == "Chores"){
            colour = "Yellow";
           }
           else if (category == "Work"){
            colour = "Black";
           }

           else{
            colour = "grey";
           }
          
          }

        }


        // store data so the calendar knows to render an event upon drop
        $(this).data('event', {
          title: name2, // use the element's text as the event title
          stick: true, // maintain when user navigates (see docs on the renderEvent method)
          color: colour,
          description: 'This is a cool event',
          complete: false,
          duration: time
        });

        // make the event draggable using jQuery UI
        $(this).draggable({
          zIndex: 999,
          revert: true,      // will cause the event to go back to its
          revertDuration: 0  //  original position after the drag
        });

      });
      return false;
      // validate and process form here
    });
  });


  //Close modal when close button is pressed//
  $(".close").click(function(){
        $("#myModal").modal("hide");
  });

  //Activate textfield when modal is shown//
  $('#myModal').on('shown.bs.modal', function () {
  $('#tName').focus();
  });

  $(function() {
    $(".editButton").click(function() {
      element.title = $('#editName').val();
      console.log(element.title);
      $('#editModal').modal("hide");
      $('#calendar').fullCalendar('updateEvent', element);
    

      // if (validateForm()) {

      //     taskName = $('#tName').val();
      //     dury = $('#dury').val();
      //     category = $("#category").val();
      //     $('#myModal').modal('hide')
      //     $("#list").append("<div class='task-drag'><label>" + taskName + "</label><img src='../rubbish-bin.png'  id='removeBin' ></div>");
      //     $('#tName').val('');
      //     $('#hiddenText').hide();

      //     newTask = {name: taskName, duration: dury, category: category};
      //     allEvents.push(newTask);
      //     $.ajax(
      //         {
      //             url: "http://localhost:3000/new_task",
      //             async: true,
      //             type: "POST",
      //             data: newTask,
      //             success: function (result) {
      //                 console.log("successfully added");
      //             }
      //         });
      // }

      // $("#task-list .task-drag" ).each(function() {

      //   //name = "Hey";
      //   name2 = $(this).text(); 
      //   time = "04:00:00";
      //   colour = "grey"; 

      //   var arrayLength = allEvents.length;
      //   for (var i = 0; i < arrayLength; i++) {
      //     if(name2 == allEvents[i].name){
      //      time = "0"+allEvents[i].duration + ":00:00";
      //      category = allEvents[i].category;

      //      if (category == "University"){
      //       colour = "Blue";
      //      }
      //      else if(category == "Chores"){
      //       colour = "Yellow";
      //      }
      //      else if (category == "Work"){
      //       colour = "Black";
      //      }

      //      else{
      //       colour = "grey";
      //      }
          
      //     }

      //   }


      //   // store data so the calendar knows to render an event upon drop
      //   $(this).data('event', {
      //     title: name2, // use the element's text as the event title
      //     stick: true, // maintain when user navigates (see docs on the renderEvent method)
      //     color: colour,
      //     description: 'This is a cool event',
      //     complete: false,
      //     duration: time
      //   });

      //   // make the event draggable using jQuery UI
      //   $(this).draggable({
      //     zIndex: 999,
      //     revert: true,      // will cause the event to go back to its
      //     revertDuration: 0  //  original position after the drag
      //   });

      // });
      // return false;
      // validate and process form here
    });
  });


  //Close modal when close button is pressed//
  $(".close").click(function(){
        $("#myModal").modal("hide");
  });

  //Activate textfield when modal is shown//
  $('#myModal').on('shown.bs.modal', function () {
  $('#tName').focus();
  });



    /* initialize the external events
    -----------------------------------------------------------------*/
    // get tasks in database and add to task list
    $.getJSON('/tasks', function(data){

      // get each task description in database
      $.each(data, function(key, val){
        var description = (JSON.stringify(val))
        description = description.split('"')[3]

        // create new task with description
        $("#list").append("<div class='task-drag' id=" + key + "><label>" + description + 
          "</label>" + "<img src='../rubbish-bin.png'  id='removeBin' ></div>")

        // data for calendar
        $("#" + key).data('event', {
          title: $.trim($("#" + key).text()), // use the element's text as the event title
          stick: true, // maintain when user navigates (see docs on the renderEvent method)
          color: 'green',
          description: description,
          complete: false
        })

        // make task draggable
        $("#" + key).draggable({
          zIndex: 999,
          revert: true,      // will cause the event to go back to its
          revertDuration: 0  //  original position after the drag
        });
      });
    });

    $('#task-list .task-drag').each(function() {
      // store data so the calendar knows to render an event upon drop
      $(this).data('event', {
        title: $.trim($(this).text()), // use the element's text as the event title
        stick: true, // maintain when user navigates (see docs on the renderEvent method)
        color: 'green',
        description: 'This is a cool event',
        complete: false
      });

      // make the event draggable using jQuery UI
      $(this).draggable({
        zIndex: 999,
        revert: true,      // will cause the event to go back to its
        revertDuration: 0  //  original position after the drag
      });

    });

    
    /* initialize the calendar
    -----------------------------------------------------------------*/

    $('#calendar').fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      editable: true,
      droppable: true, // this allows things to be dropped onto the calendar
      dragRevertDuration: 0,
      drop: function() {
          let event_name = $(this)[0].innerText;
          let time = '';
          let category='';
          console.log($(this).parent());
          for (var i = 0; i < allEvents.length; i++) {
              if (event_name == allEvents[i].name) {
                  time = "0" + allEvents[i].duration + ":00:00";
                  category = allEvents[i].category;
              }
          }
          event = {name: event_name, duration: time, cat: category};
          $.ajax(
              {
                  url: "http://localhost:3000/new_cal_task",
                  async: true,
                  type: "POST",
                  data: event,
                  success: function (result) {
                      console.log("successfully added calendar task");
                  }
              });
        // is the "remove after drop" checkbox checked?
          // if so, remove the element from the "Draggable Events" list
          $(this).remove();
        
      },

      //When mouse hovers over
      

      eventDragStart: function( event, jsEvent, ui, view ) { 
        dragging = true;
        $('.popover').popover('hide');

      },

     


      //on EventClick
      eventClick: function (calEvent, jsEvent, view) {
        //closePopovers();
        popoverElement = $(jsEvent.currentTarget);
        element = calEvent;
        
     
      },

      /*Triggered when an event is being rendered*/
      eventRender: function(event,jsEvent){
        if(!event.complete){
          //popover properties

          jsEvent.popover({
            
            html: true,
            content: popTemplate,
            template: popTemplate,
            animation: true,
            container:'body',
            //trigger:'manual'
          });

          

          //Use the code below if popover trigger is hover 
          //.on("mouseenter", function () { 
          //   var _this = this;
          //   $(this).popover("show");
          //   $(".popover").on("mouseleave", function () {
          //         $(_this).popover("hide");
          //   });
          
          // }).on("mouseleave", function () {
          //   var _this = this;
          //   setTimeout(function () {
          //     if (!$(".popover:hover").length) {
          //       $(_this).popover("hide");
          //     }
          //   }, 300);
          // });
        }else {
          jsEvent.fadeTo(0, 0.5);
        }
      
      },



      //function fires when event is finished dragging
      eventDragStop: function( event, jsEvent, ui, view ) {
        dragging = false;
        
        var external_events = $( ".tabList" );
        var offset = external_events.offset();
        offset.right = external_events.width() + offset.left;
        offset.bottom = external_events.height() + external_events.position().top;
        console.log("external height" + external_events.height());  
        console.log("offset down:" +offset.bottom)
        console.log("offset right:" +offset.right);
        console.log("offset up:" + external_events.position().top);
        console.log("offset left:" +offset.left);
        console.log("jsEvent.clientX:" + jsEvent.pageX);
        console.log("jsEvent.clientY:" + jsEvent.pageY);

     
            // Compare
        if (jsEvent.pageX >= offset.left
          && jsEvent.pageY >= external_events.position().top
          && jsEvent.pageX <= offset.right
          && jsEvent.pageY <= offset.bottom
         ) { 
            $('#calendar').fullCalendar('removeEvents', event._id); 
    
            var el = $( "<div class='task-drag'><label>"+event.title + "</label><img src='../rubbish-bin.png'  id='removeBin' ></div>").appendTo( "#list");
            el.draggable({
              zIndex: 999,
              revert: true, 
              revertDuration: 0 
            });
            el.data('event', { 
              title: event.title, 
              id :event.id, 
              stick: true, 
              color: 'green',
              description: "Jump",
              complete: false
            });
          }
      }
    });

  openCity(event,'Ongoing');


  });

document.load();


//Holds the jquery object
var popoverElement;

//Holds the event object
var element;

  // Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("add");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];


//Validates AddTask Modal//
function validateForm() {
    var x = document.forms["myForm"]["fname"].value;
    if (x == "") {
        $('#hiddenText').show();
        return false;
    }else {
      return true;
    }
}






// $('wrap').on('click','#toggle',function (e) {
//   console.log(element);
//   alert('yes');
//   $(".circle-loader").toggleClass("load-complete");
//   $(".checkmark").toggle();
//   $("#showCompleted").slideToggle('slow', 	taskCompleted());
// });

//Mark the task as complete
// function checkTask(){
//   $(".circle-loader").toggleClass("load-complete");
//   $(".checkmark").toggle();
//   $("#showCompleted").slideToggle('fast',taskCompleted());
// }
//Change properties of the event when the task is completed
function taskCompleted() {
  setTimeout(function() {
    $('.popover').not(this).popover('hide');
    popoverElement.popover('destroy');
  }, 800);

    element.editable = false;
    element.complete = true;
    popoverElement.fadeTo('slow', 0.5);
    $('#calendar').fullCalendar('updateEvent', element);
}

function closePopovers() {
  $('.popover').not(this).popover('hide');
}




//Checks if the task being dragged is in the proximity of the the task list//
var isEventOverDiv = function(x, y) {

    var external_events = $( "#task-list" );
    var offset = external_events.offset();
    offset.right = external_events.width() + offset.left;
    offset.bottom = external_events.height() + offset.top;

            // Compare
    if (x >= offset.left
      && y >= offset.top
      && x <= offset.right
      && y <= offset .bottom) {
        alert("Inside");
        return true; }
    else {
      return false;
    }

  }
  //Marks the current task list tab that is open//
  function openCity(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
       
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }

  
