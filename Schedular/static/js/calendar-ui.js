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
calendarEvents=[];
justDragged=[]

$(document).ready(function() {

  //Task List is displayed on default
  document.getElementById("defaultOpen").click();


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


    //This is the popover code that gets displayed when a event is clicked on
    var popTemplate = [
      '<div tabindex="0" class="popover" style="max-width:600px;">',
      '<div class="arrow"></div>',
      //'<div class="popover-content"></div>',
      '<div class="popHeader">',
      '<label id=popLabel></label>',
      '<span class="popOptions">',
      '<button class="fileContainer">',
      'Add Files',
      '<input id="addFile" type="file"/>',
      '</button>',
      '<button class="editTask">Edit</button>',
      '<div class="circle-loader">',
      '<div class = "checkmarkoverlay"></div>',
      '<div class="checkmark draw"></div>',
      '</div></span>',
      '</div>',
      '<br/><br/>',
      '<ul class="file-list">',
      '<h4>File List</h4>',
      '</ul>',
      '<div id="Notes">',
      '<h4>Notes</h4>',
      '<textarea rows="4" cols="50"></textarea>',
      '</div>',
       '</div>'].join('');

    //Modal start appears when adding task//
    $("#add").click(function(){
        $("#myModal").modal();
     
    });

   


    //Adds file labels to the file list when
    //user adds files to a particular task
    //TO DO: The files added need to be linked to the database
    $(document).on('change', '#addFile', function(e){
      var fileName = e.target.files[0].name;
      var currentPopover = $(this).closest('.popover');
      currentPopover.find('ul.file-list').append('<li><a>' +fileName+ '</a></li>');
      if (currentPopover.find('ul.file-list').children('li').length >0){
        currentPopover.find('ul.file-list').show();
      }

      
    });



    //eventlistener to displays bin icon when the mouse
    //hovers overs a task in the task list
    $(document).on('mouseenter', '.task-drag', function(){

      $(this).find("#removeBin1").css('display', 'inline-block');
      
    });


    //eventlistener that hides the bin icon when the mouse
    // leaves the the task
    $(document).on('mouseleave', '.task-drag', function(){
      $(this).find("#removeBin1").css('display', 'none');
      
    });



    //eventlistener that fires when user clicks on the bin icon
    //This removes the task from the interface and the database
    $(document).on('click', '#removeBin1', function(){
      $(this).parent().remove();
      let task_id = $(this).parent()[0].dataset.taskid;
      for (var i = 0; i < allEvents.length; i++) {
          if (task_id == allEvents[i].id) {
              allEvents.splice(i, 1);
          }
      }
     $.ajax(
      {
        url: "http://localhost:3000/delete_task",
        async: true,
        type: "POST",
        data: {taskid: task_id},
        success: function (result) {
        console.log("successfully deleted");
        }
      });
    });


    //eventlistener for when editing a task when the edit
    // button is pressed
    //TO DO: make changes to other properties of the task
    //TO DO: changes to be edited in the database
    $(document).on('click', '.editTask', function(){
      $('.popover').popover('hide');
      $("#editModal").modal();
     
      $('#editName').val(element.title);
      //Add the rest of the task options eg. duration,repeat, Due Date

    });
    


    //eventlistener for when completing the task
    //toggles status to complete
    $(document).on('click', '.circle-loader', function(){
      $(this).toggleClass('load-complete');
      $(this).find(".checkmark").toggle('fast',taskCompleted());
    });

    
    

    //This needs to be checked every time a task is added into the calendar
    $(function() {
        let newEventID=0;
    $(".CreateButton").click(function() {
      if (validateForm()) {
          taskName = $('#tName').val();
          dury = $('#dury').val();
          category = $("#category").val();
          repeat = $('#repeat').val();
          dueDate = $('#dueDate').val();
          priority = $('#priority').val();


          let new_task = {name: taskName, duration: dury, category: category, priority: priority, dueDate: dueDate};
          $.ajax(
              {
                  url: "http://localhost:3000/new_task",
                  async: false,
                  type: "POST",
                  data: new_task,
                  success: function (result) {
                      let task_id = JSON.parse(result);
                      new_task.id = task_id;
                      newEventID = new_task.id;
                      allEvents.push(new_task);
                  }
              });

          $('#myModal').modal('hide')
          if(category == "University") {
              $("#list").append("<div class='task-drag' id='" + taskName +"' style='background: #6578a0' data-taskid=" +new_task.id+ "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/></div>");
          }else if(category =="Work"){
              $("#list").append("<div class='task-drag' id='" + taskName +"' style='background: #84b79d' data-taskid=" +new_task.id+ "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/></div>");
          }else if(category =="Fun"){
              $("#list").append("<div class='task-drag' id='" + taskName +"' style='background: #c3c60b' data-taskid=" +new_task.id+ "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/></div>");
          }else if(category =="Chores"){
              $("#list").append("<div class='task-drag' id='" + taskName +"' style='background: #e5a190' data-taskid=" +new_task.id+ "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/></div>");
          }else if(category =="Hobby"){
              $("#list").append("<div class='task-drag' id='" + taskName +"' style='background: #c18fe8' data-taskid=" +new_task.id+ "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/></div>");
          }else if(category =="Other"){
              $("#list").append("<div class='task-drag' id='" + taskName +"' style='background: grey' data-taskid=" +new_task.id+ "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/></div>");
          }          $('#tName').val('');
          $('#hiddenText').hide();
          $("#list").sortable('refresh');


      }

      $("#task-list .task-drag" ).each(function() {
        let id = $(this).data.taskid;
        let name = $(this).text();
        time = "04:00:00";
        colour = "grey";

        var arrayLength = allEvents.length;
        for (var i = 0; i < arrayLength; i++) {
          if(id == allEvents[i].id){
           time = "0"+allEvents[i].duration + ":00:00";
           category = allEvents[i].category;
              if (category == "University"){
                  colour = "#6578a0"; /*blue*/
              }
              else if(category == "Work"){
                  colour = "#84b79d"; /*green*/
              }
              else if (category == "Fun"){
                  colour = "#c3c60b"; /*yellow*/
              }
              else if (category == "Chores"){
                  colour = "#e5a190"; /*orange*/
              }
              else if (category == "Hobby"){
                  colour = "#c18fe8"; /*purple*/
              }
              else{
                  colour = "grey";
              }
          }

        }


        // store data so the calendar knows to render an event upon drop
        $(this).data('event', {
          title: name, // use the element's text as the event title
          stick: true, // maintain when user navigates (see docs on the renderEvent method)
          color: colour,
          description: 'This is a cool event',
          complete: false,
          duration: time
        });

        // make the event draggable using jQuery UI
        // $(this).draggable({
        //   zIndex: 999,
        //   revert: true,      // will cause the event to go back to its
        //   revertDuration: 0  //  original position after the drag
        // });

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

      //CAN I CHANGE THE ID OF THIS TASK FROM KEY TO EVENT TITLE??????????
      $.each(data, function(key, val){
        if(val.in_calendar==true) {
            return;
        }
        let description = val.description;
        let newTask = {id: val.item_id, name: description, duration: val.num_hours, category: val.category, priority: val.priority, dueDate: val.due_date};
        //let newTask = {name: description, duration: val.num_hours, category: val.category, repeat: val.repeat, dueDate: val.due_date};
        allEvents.push(newTask);
        // create new task with description
        $("#list").append("<div class='task-drag' id=" + key + " data-taskid = " + val.item_id + "><label>" + description +
        "</label>" + "<img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/></div>")

          // data for calendar
        $("#" + key).data('event', {
          title: $.trim($("#" + key).text()), // use the element's text as the event title
          stick: true, // maintain when user navigates (see docs on the renderEvent method)
          color: 'green',
          description: description,
          complete: false
        });

        // make task draggable
        $("#" + key).draggable({
          zIndex: 999,
          revert: true,      // will cause the event to go back to its
          revertDuration: 0  //  original position after the drag
        });
      });
    });

    // get each calendar item description in database
    $.getJSON('/load_cal_items', function(data){
        $.each(data, function(key, val){
            let date = val.yyyymmdd;
            let parent = val.parent_task_id;
            let date_split = date.split();
            let timeless_date = date_split[0];
            let start_date = timeless_date+'T'+val.start_time;
            let end_date = timeless_date+'T'+val.end_time;
            let due_date = val.due_date;
            let priority = val.priority;
            let newEvent = {
                title: val.description,
                id: val.item_id,
                start: start_date,
                end: end_date,
                parent_task: parent,
                duration: val.num_hours,
                category: val.category,
                due_date: due_date,
                priority: priority,
            };
            calendarEvents.push(newEvent);
        });
        $('#calendar').fullCalendar('renderEvents', calendarEvents, 'stick');
    });


    $('#task-list .task-drag').each(function() {
        console.log($(this));
      // store data so the calendar knows to render an event upon drop
      $(this).data('event', {
        title: $.trim($(this).text()), // use the element's text as the event title
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
      drop: function(date) {
          let task_id = $(this)[0].dataset.taskid;
          let event_name = $(this)[0].innerText;
          var category;
          var duration_ms;
          var startTime;
          var endTime;
          var dueDate;
          var priority;
          for (var i = 0; i < allEvents.length; i++) {
              if (task_id == allEvents[i].id) {
                  let time = allEvents[i].duration;
                  category = allEvents[i].category;
                  startTime = date.format();
                  duration_ms = time*60*60*1000;
                  endTime = date.clone().add(duration_ms).format();
                  dueDate = allEvents[i].dueDate;
                  priority = allEvents[i].priority;
                  allEvents.splice(i,1);
              }
          }
          let newCalEvent = {name: event_name, duration: duration_ms, cat: category, start: startTime, end: endTime,
              parent_task: task_id, due_date: dueDate, priority: priority};

          let event = {name: event_name, duration: duration_ms, cat: category, start: startTime, end: endTime};

          $.ajax(
              {
                  url: "http://localhost:3000/new_cal_task",
                  async: true,
                  type: "POST",
                  data: newCalEvent,
                  success: function (result) {
                      let id = JSON.parse(result);
                      newCalEvent.id = id;
                  }
              });
          newCalEvent.duration=duration_ms/(60*60*1000);
          calendarEvents.push(newCalEvent);
          $('#calendar').fullCalendar('renderEvents', newCalEvent, 'stick');
          console.log(newCalEvent);
        // is the "remove after drop" checkbox checked?
          // if so, remove the element from the "Draggable Events" list
         $(this).remove();
          // $('#calendar').fullCalendar('renderEvent', event, true);

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
          console.log(event);
          if(!event.complete) {
            //popover properties

            jsEvent.popover({

                html: true,
                content: popTemplate,
                template: popTemplate,
                animation: true,
                container: 'body',
                //trigger:'manual'
            });
            let dragEvent=event;
            console.log(justDragged[0]);
            if (justDragged.length > 0 && justDragged[0].id == dragEvent.id) {
                let newStart = dragEvent.start._d.toISOString().split('.', 1)[0];
                let newEnd = dragEvent.end._d.toISOString().split('.', 1)[0];
                let eventData = {
                    name: justDragged[0].title,
                    start: newStart,
                    end: newEnd,
                    oldStart: justDragged[0].start,
                    oldEnd: justDragged[0].end
                };
                if (newStart != justDragged[0].start || newEnd != justDragged[0].end) {
                    $.ajax(
                        {
                            url: "http://localhost:3000/update_cal_task",
                            async: true,
                            type: "POST",
                            data: eventData,
                            success: function (result) {
                                console.log("successfully updated calendar task");
                            }
                        });
                    let i = calendarEvents.indexOf(justDragged[0]);
                    calendarEvents.splice(i, 1);
                    let newCalEvent = {
                        id: justDragged[0].id,
                        name: justDragged[0].title,
                        duration: justDragged[0].duration,
                        cat: justDragged[0].category,
                        start: newStart,
                        end: newEnd,
                        parent_task: justDragged[0].parent_task
                    };
                    calendarEvents.push(newCalEvent);
                    justDragged.pop();
                }
            }

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
        console.log("inside dragging");
        dragging = false;
        for (let i=0; i<calendarEvents.length; i++) {
            if(calendarEvents[i].id==event.id) {
                justDragged.push(calendarEvents[i]);
            }
        }
        var external_events = $( ".tabList" );
        var offset = external_events.offset();
        offset.right = external_events.width() + offset.left;
        offset.bottom = external_events.height() + external_events.position().top;

            // Compare
        if (jsEvent.pageX >= offset.left
          && jsEvent.pageY >= external_events.position().top
          && jsEvent.pageX <= offset.right
          && jsEvent.pageY <= offset.bottom
         ) {
            let task_id=0;
            console.log("inside tasklist");
            for(let i=0; i<calendarEvents.length; i++) {
                console.log(calendarEvents[i].id);
                console.log(event.id);
                if(calendarEvents[i].id===event.id) {
                    let id=calendarEvents[i].id;
                    let parent=calendarEvents[i].parent_task;
                    task_id=parent;
                    let newTask = {id: parent, name: calendarEvents[i].name,
                        duration: calendarEvents[i].duration, category: calendarEvents[i].cat,
                        priority: calendarEvents[i].priority, dueDate: calendarEvents[i].due_date};
                    allEvents.push(newTask);
                    calendarEvents.splice(i, 1);
                    justDragged.pop();
                    $.ajax(
                        {
                            url: "http://localhost:3000/remove_cal_task",
                            async: true,
                            type: "POST",
                            data: {id: id, parent_id: parent},
                            success: function (result) {
                                console.log("successfully removed calendar task");
                            }
                        });
                    $('#calendar').fullCalendar('removeEvents', event._id);
                    var el = $( "<div class='task-drag' id='" +event.title+ "' data-taskid=" + task_id +"><label>"+event.title + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/></div>").appendTo( "#list");
                    // el.draggable({
                    //   zIndex: 999,
                    //   revert: true,
                    //   revertDuration: 0
                    // });

                    el.data('event', {
                        title: event.title,
                        id :event.id,
                        stick: true,
                        color: 'green',
                        description: "Jump",
                        complete: false
                    });
                    $("#list").sortable('refresh');
                }
            }

          }

      },



    });



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
function isEventOverDiv(x, y) {

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

  
