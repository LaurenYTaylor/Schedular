$(document).ready(function() {
    console.log(window.location.pathname);

    //Modal start appears when adding task//
    $("#add").click(function(){
        $("#myModal").modal();
     
    });

    //This needs to be checked every time a task is added into the calendar
    $(function() {
    $(".CreateButton").click(function() {
      if (validateForm()){
        $('#myModal').modal('hide')
        $("#list").append("<div class='task-drag'>" + $('#tName').val() + "</div>");
        $('#tName').val('');
        $('#hiddenText').hide();

      }
      $("#task-list .task-drag" ).each(function() {

        // store data so the calendar knows to render an event upon drop
        $(this).data('event', {
          title: $.trim($(this).text()), // use the element's text as the event title
          stick: true, // maintain when user navigates (see docs on the renderEvent method)
          color: 'green',
          description: 'This is a cool event'
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
          "</label> </div>")

        // data for calendar
        $("#" + key).data('event', {
          title: $.trim($("#" + key).text()), // use the element's text as the event title
          stick: true, // maintain when user navigates (see docs on the renderEvent method)
          color: 'green',
          description: description
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
        description: 'This is a cool event'
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
        // is the "remove after drop" checkbox checked?
        
          // if so, remove the element from the "Draggable Events" list
          $(this).remove();
        
      },
      eventDragStop: function( event, jsEvent, ui, view ) {

        var external_events = $( "#task-list" );
        var offset = external_events.offset();
        offset.right = external_events.width() + offset.left;
        offset.bottom = external_events.height() + offset.top;
    
     
            // Compare
        if (jsEvent.clientX >= offset.left
          && jsEvent.clientY >= offset.top
          && jsEvent.clientX <= offset.right
          && jsEvent.clientY <= offset .bottom) { 
            $('#calendar').fullCalendar('removeEvents', event._id); 
    
            var el = $( "<div class='task-drag'>" ).appendTo( "#list").text( event.title );
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
              description: "Jump"
            });
          }
      }
    });

  openCity(event,'Ongoing');


  });

document.load()

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
      && y <= offset .bottom) { return true; }
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
