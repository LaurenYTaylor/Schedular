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
justDragged=[];

$(document).ready(function() {

    //Task List is displayed on default
    document.getElementById("defaultOpen").click();


    $(function(){
        $('#datetimepicker1').datetimepicker();
    });

    $(function(){
        $('#datetimepicker2').datetimepicker();
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
        '<textarea rows="4" cols="50" id="notes"></textarea>',
        '</div>',
        '<input type = "submit" id="save" value="save">',
        '</div>'].join('');

    //Modal start appears when adding task//
    $("#add").click(function(){
        $("#myModal").modal();

    });

    $(function() {
        $('.catCreate').click(function() {
            data = $('#catName').val()
            $('#catModal').modal('hide')
            $.ajax(
                {
                    url: "http://localhost:3000/add_categories",
                    async: true,
                    type: "POST",
                    data: data,
                    success: function (result) {
                        console.log("successfully added");
                    }
                });
        });
        return false;
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
        $(this).find("#edit1").css('display', 'inline-block');

    });


    //eventlistener that hides the bin icon when the mouse
    // leaves the the task
    $(document).on('mouseleave', '.task-drag', function(){
        $(this).find("#removeBin1").css('display', 'none');
        $(this).find("#edit1").css('display', 'none');

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
        $('#editDury').val(element.duration);
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
                if (category == "University") {
                    $("#list").append("<div class='task-drag' style='background: #6578a0' data-taskid=" + new_task.id + "><label>" + taskName + "</label>" + "<img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/> " +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                } else if (category == "Work") {
                    $("#list").append("<div class='task-drag' style='background: #84b79d' data-taskid=" + new_task.id + "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                } else if (category == "Fun") {
                    $("#list").append("<div class='task-drag' style='background: #c3c60b' data-taskid=" + new_task.id + "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                } else if (category == "Chores") {
                    $("#list").append("<div class='task-drag' style='background: #e5a190' data-taskid=" + new_task.id + "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                } else if (category == "Hobby") {
                    $("#list").append("<div class='task-drag' style='background: #c18fe8' data-taskid=" + new_task.id + "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                } else if (category == "Other") {
                    $("#list").append("<div class='task-drag' style='background: grey' data-taskid=" + new_task.id + "><label>" + taskName + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                }
                $('#tName').val('');
                $('#hiddenText').hide();
                //This sortable thing isn't working idk why
                $("#list").sortable('refresh');
                return false;
                // validate and process form here
            }
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
            var name = $('#editName').val();
            var hours = $('#editDury').val();
            var category = $('#editCat').val();
            var due_date = $('#newDate').val();
            var repeat = $('#editRepeat').val();
            var start = new Date(element.start);
            var end_date = new Date(start.getTime() + (60000 * 60 * hours));
            end_date = end_date.toISOString().split('.', 1)[0];


            element.title = name;
            element.duration = hours;
            element.cat = category;
            element.end = end_date;
            element.repeat = repeat;
            if(due_date != '') {
                due_date = due_date.split(' ', 1);
                element.due_date = due_date;
            }

            else {
                due_date = element.due_date;
            }

            $('#editModal').modal("hide");
            $('#calendar').fullCalendar('updateEvent', element);

            id = element.id;
            data = {
                id: id,
                newName: name,
                newDury: hours,
                newCat: category,
                //newDue: dueDate,
                end: end_date.split('T')[1],
                repeat: repeat
            }

            $.ajax(
                {
                    url: "http://localhost:3000/edit_task",
                    async: true,
                    type: "POST",
                    data: data,
                    success: function (result) {
                        console.log("successfully added");
                    }
                });

        });
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
            let category = newTask.category;
                if (category == "University") {
                    $("#list").append("<div class='task-drag' style='background: #6578a0' data-taskid=" + newTask.id + "><label>" + description + "</label>" + "<img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/> " +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                } else if (category == "Work") {
                    $("#list").append("<div class='task-drag' style='background: #84b79d' data-taskid=" + newTask.id + "><label>" + description + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                } else if (category == "Fun") {
                    $("#list").append("<div class='task-drag' style='background: #c3c60b' data-taskid=" + newTask.id + "><label>" + description + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                } else if (category == "Chores") {
                    $("#list").append("<div class='task-drag' style='background: #e5a190' data-taskid=" + newTask.id + "><label>" + description+ "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                } else if (category == "Hobby") {
                    $("#list").append("<div class='task-drag' style='background: #c18fe8' data-taskid=" + newTask.id + "><label>" + description + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                } else if (category == "Other") {
                    $("#list").append("<div class='task-drag' style='background: grey' data-taskid=" + newTask.id + "><label>" + description + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                        "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                }
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
            let note = val.notes;
            let newEvent = {
                title: val.description,
                id: val.item_id,
                start: start_date,
                end: end_date,
                parent_task: parent,
                duration: val.num_hours,
                cat: val.category,
                due_date: due_date,
                priority: priority,
                note: note
            };
            switch(newEvent.cat) {
                case "University":
                    newEvent.color = '#6578a0';
                    break;
                case "Work":
                    newEvent.color = '#84b79d';
                    break;
                case "Fun":
                    newEvent.color = '#c3c60b';
                    break;
                case "Chores":
                    newEvent.color = '#e5a190';
                    break;
                case "Hobby":
                    newEvent.color = '#c18fe8';
                    break;
                case "Other":
                    newEvent.color = 'grey';
            }
            calendarEvents.push(newEvent);
        });
        $('#calendar').fullCalendar('renderEvents', calendarEvents, 'stick');
    });

    $('#list').sortable(
        {
            items: ".task-drag",
            opacity: .6,
            placeholder: 'placeholder',

            helper:   'clone',
            update: function(event, ui) {
                console.log($( "#list" ).sortable( "toArray" ));
            }
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
            var time;
            for (var i = 0; i < allEvents.length; i++) {
                if (task_id == allEvents[i].id) {
                    time = allEvents[i].duration;
                    category = allEvents[i].category;
                    startTime = date.format();
                    duration_ms = time*60*60*1000;
                    endTime = date.clone().add(duration_ms).format();
                    dueDate = allEvents[i].dueDate;
                    priority = allEvents[i].priority;
                    allEvents.splice(i,1);
                }
            }
            //Put time in appropriate format (IOString) for insertion into the database
            let start = 9;
            let end = start+parseInt(time);
            let start_split = startTime.split('T');
            if(!start_split[1]) {
                startTime = startTime+"T09:00:00";
            }
            let end_split = endTime.split('T');
            if(!end_split[1]) {
                if(end<10) {
                    endTime = end_split[0]+"T0"+end+":00:00";
                } else {
                    endTime = end_split[0]+"T"+end+":00:00";
                }
            }
            let newCalEvent = {title: event_name, duration: duration_ms, cat: category, start: startTime, end: endTime,
                parent_task: task_id, due_date: dueDate, priority: priority};
            switch(newCalEvent.cat) {
                case "University":
                    newCalEvent.color = '#6578a0';
                    break;
                case "Work":
                    newCalEvent.color = '#84b79d';
                    break;
                case "Fun":
                    newCalEvent.color = '#c3c60b';
                    break;
                case "Chores":
                    newCalEvent.color = '#e5a190';
                    break;
                case "Hobby":
                    newCalEvent.color = '#c18fe8';
                    break;
                case "Other":
                    newCalEvent.color = 'grey';
            }
            $.ajax(
                {
                    url: "http://localhost:3000/new_cal_task",
                    async: false,
                    type: "POST",
                    data: newCalEvent,
                    success: function (result) {
                        let id = JSON.parse(result);
                        newCalEvent.id = id;
                        newCalEvent.duration=duration_ms/(60*60*1000);

                    }
                });
            calendarEvents.push(newCalEvent);
            // is the "remove after drop" checkbox checked?
            // if so, remove the element from the "Draggable Events" list
            $(this).remove();
            $('#calendar').fullCalendar('renderEvent', newCalEvent, 'stick');
            //$('#calendar').fullCalendar('removeEvents', newCalEvent.id);
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


            $('#notes').val(element.note);

            //add notes to database
            let task_id = calEvent.id
            $('#save').click(function(){
                alert("save")
                var note = $('#notes').val();
                var data = {
                    id: task_id,
                    note: note
                };



                $.ajax(
                {
                    url: "http://localhost:3000/add_notes_files",
                    async: true,
                    type: "POST",
                    data: data,
                    success: function (result) {
                        console.log("successfully added");
                    }
                });
            })
        },

        /*Triggered when an event is being rendered*/
        eventRender: function(event,jsEvent){
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
                if (justDragged.length > 0 && justDragged[0].id == dragEvent.id) {
                    let newStart = dragEvent.start._d.toISOString().split('.', 1)[0];
                    let newEnd = dragEvent.end._d.toISOString().split('.', 1)[0];
                    let eventData = {
                        title: justDragged[0].title,
                        start: newStart,
                        end: newEnd,
                        oldStart: justDragged[0].start,
                        oldEnd: justDragged[0].end,
                        id: justDragged[0].id
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
                            title: justDragged[0].title,
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
            }else {
                jsEvent.fadeTo(0, 0.5);
            }

        },



        //function fires when event is finished dragging
        eventDragStop: function( event, jsEvent, ui, view ) {
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
                for(let i=0; i<calendarEvents.length; i++) {
                    if(calendarEvents[i].id==event.id) {
                        let id=calendarEvents[i].id;
                        let parent=calendarEvents[i].parent_task;
                        task_id=parent;
                        console.log("THE FOLLOWING TASK HAS BEEN ADDED BACK TO THE TASK LIST");
                        let newTask = {id: parent, name: calendarEvents[i].title,
                            duration: calendarEvents[i].duration, category: calendarEvents[i].cat,
                            priority: calendarEvents[i].priority, dueDate: calendarEvents[i].due_date};
                        console.log(newTask);
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
                        let category = newTask.category;
                        if (category == "University") {
                            $("#list").append("<div class='task-drag' style='background: #6578a0' data-taskid=" + newTask.id + "><label>" + newTask.name + "</label>" + "<img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/> " +
                                "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                                "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                        } else if (category == "Work") {
                            $("#list").append("<div class='task-drag' style='background: #84b79d' data-taskid=" + newTask.id + "><label>" + newTask.name + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                                "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                                "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                        } else if (category == "Fun") {
                            $("#list").append("<div class='task-drag' style='background: #c3c60b' data-taskid=" + newTask.id + "><label>" + newTask.name + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                                "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                                "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                        } else if (category == "Chores") {
                            $("#list").append("<div class='task-drag' style='background: #e5a190' data-taskid=" + newTask.id + "><label>" + newTask.name + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                                "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                                "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                        } else if (category == "Hobby") {
                            $("#list").append("<div class='task-drag' style='background: #c18fe8' data-taskid=" + newTask.id + "><label>" + newTask.name + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                                "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                                "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                        } else if (category == "Other") {
                            $("#list").append("<div class='task-drag' style='background: grey' data-taskid=" + newTask.id + "><label>" + newTask.name + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
                                "\<img id='edit1' src='../gap.png'   style='float: right; display:none;' width='6'/>" +
                                "<img id='edit1' src='../edit-icon.png'   style='float: right; display:none;' width='16'/></div>");
                        }

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

  
