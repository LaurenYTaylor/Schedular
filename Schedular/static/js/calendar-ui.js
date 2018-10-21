//popover complete is still somewhat buggy
// requires 2 clicks to initialize popover after initial popover
//Indicator to should if the task is weekly monthly or daily on the task list


//global variable to determine if user is dragging
var dragging = false;
var previouspopover;

//e.target -object that is clicked on
//popoverElement - event that contains the popover
$('html').on('click', function (e) {
    //console.log(e.target);
    //console.log(popoverElement);



    //if object clicked is not the popover object hide the popover
    //if the popover itself is clicked on do not close the popover
    if(popoverElement && e.target){
        if (!(popoverElement).is(e.target) &&
            popoverElement.has(e.target).length === 0 &&
            $('.popover').has(e.target).length === 0){
            popoverElement.popover('hide');
        }
    };


});



allEvents = [];
calendarEvents=[];
justDragged=[];
subtasks=[];

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


    //THIS IS WHERE THE SUBTASK IS ADDED TO THE TASK LIST
    //TO DO: ADD SUBTASK TO DATABASE
    $(document.body).on('keyup', '#addsub', function(event) {
        if(event.keyCode == 13) { // 13 = Enter Key
            if(($("#addsub").val()).trim() != ""){
                var description = ($("#addsub").val()).trim();
                var id;

                var newSub = {
                    description: description,
                    parent: element.id,
                    comleted: false
                }

                $.ajax(
                {
                    url: "http://localhost:3000/add_subtask",
                    async: true,
                    type: "POST",
                    data: {
                        description: description,
                        parent_id: element.id,
                        completed: false
                    },
                    success: function (result) {
                        //console.log("successfully added");
                        id  = JSON.parse(result);
                        newSub.id = id;

                        subtasks.push(newSub);

                        $(".subtasklist").append('<li class="subtask"><input type="checkbox" ' + 
                            'id=' + id + ' class="sub-checkbox"><div class="subtasklabel">'+ 
                        ($("#addsub").val()).trim() +'</div></li>');
                        $("#addsub").val('');
                        
                    }
                });      
            }
        }

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
        //'<div class="popover-content">',
        '<div class="popHeader">',
        '<label id=popLabel></label>',
        '<span class="popOptions">',
        '<button id="buttonPop" class="fileContainer">' +
        '<img id=\'file1\' src=\'../file-icon-dark.png\'   style=\'float: right; display: block;\' width=\'16\'/>',

        '<input id="addFile" type="file"/>',
        '</button>',

        '<button id="buttonPop" class="editTask">' +
        '<img id=\'edit2\' src=\'../edit-icon-dark.png\'   style=\'float: right; display: block;\' width=\'16\'/>',
        '</button>',

        '<button id="buttonPop" class="deleteTask">' +
        '<img id=\'edit2\' class="deleteCal" src=\'../icon-bin-dark.png\'   style=\'float: right; display: block;\' width=\'16\'/>',
        '</button>',


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
        '<input type = "submit" id="save" value="save"></input>',
        '<h4>Subtasks</h4>',
        '<div class="innersubtasks">',
        '<ul class="subtasklist"></ul>',
        '<input type="text" id="addsub" placeholder="Add subtask">',
        '</div>',
        '<br/>',
        '</div>'].join('');

    //Modal start appears when adding task//
    $("#add").click(function(){
        $("#myModal").modal();

    });

    $(document).on('click', '#save', function() {
            //add notes to database
        let task_id = element.id

        var note = $('#notes').val();
        element.note = note;
        $('.popover').popover('hide');
        $('#calendar').fullCalendar('updateEvent', element);
        
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
                //console.log("successfully added");

            }
        });
        
    });

    $(document).on('click', '#addCat', function() {
        $('#catModal').modal();
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
            return false;
        });
        
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

        var reader = new FileReader();
        file = reader.readAsText(e.target.files[0]).result;
        //alert(file);
        $.ajax(
        {
            url: "http://localhost:3000/add_files",
            async: true,
            type: "POST",
            data: {
                filename: fileName,
                file: file
            },
            success: function (result) {
                console.log("successfully added");
            }
        });

    });

    //eventlistener to displays bin icon when the mouse
    //hovers overs a task in the task list
    $(document).on('mouseenter', '.task-drag', function(){
        $(this).find("#removeBin1").css('visibility', 'visible');
        $(this).find("#edit1").css('visibility', 'visible');

    });


    //eventlistener that hides the bin icon when the mouse
    // leaves the the task
    $(document).on('mouseleave', '.task-drag', function(){
        $(this).find("#edit1").css('visibility', 'hidden');
        $(this).find("#removeBin1").css('visibility', 'hidden');
       

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

    //editing a task in the tasklist
    $(document).on('click', '#edit1', function(){
        $('#taskModal').modal()

        let task_id = ($(this).parent()[0].dataset.taskid);
        for(var i = 0; i < allEvents.length; i++) {
            if(task_id == allEvents[i].id) {
                curTask = allEvents[i];
            }
        }

        $('#editTName').val(curTask.name);
        $('#editTDury').val(curTask.duration);
        $('#editTCat').val(curTask.category);
        $('#editTRepeat').val(curTask.repeat);
    })


    //eventlistener for when editing a task in calendar when the edit
    // button is pressed
    //TO DO: make changes to other properties of the task
    //TO DO: changes to be edited in the database
    $(document).on('click', '.editTask', function(){
        $('.popover').popover('hide');
        $("#editModal").modal();

        $('#editName').val(element.title);
        $('#editDury').val(element.duration);
        $('#editCat').val(element.cat);
        $('#editRepeat').val(element.repeat);

        //Add the rest of the task options eg. duration,repeat, Due Date
    });


    $('.deleteCal').on('click', function () {
        //alert("drin1k");
    });


    $(document).on('click', '.deleteCal', function(){
        
        $('.popover').popover('hide');
        var firstrep= false;
        for(let i=0; i<calendarEvents.length; i++) {
             if(calendarEvents[i].id==element.id) {
                 let id=calendarEvents[i].id;
                 let parent=calendarEvents[i].parent_task;
                 task_id=parent;
                 console.log("THE FOLLOWING TASK HAS BEEN DELETED FROM THE CALENDAR");
                 calendarEvents.splice(i, 1);
                 if(!firstrep){

                    // Am i doing this right?
                    $.ajax(
                        {
                            url: "http://localhost:3000/delete_cal_task",
                            async: true,
                            type: "POST",
                            data: {id: id, parent_id: parent},
                            success: function (result) {
                                //console.log("successfully removed calendar task");
                            }
                        }); 


                    $('#calendar').fullCalendar('removeEvents', element._id);
                    firstrepeat = true;
                }
                

            }
        }
        
        
    });

    addCatsToList(categories);

    //show unshow uni categories
    $(document).on('click', '#University', function(){
        showHideCat('University');

    })

    //show unshow work categories
    $(document).on('click', '#Work', function(){
        showHideCat('Work');
    })

     //show unshow fun categories
    $(document).on('click', '#Fun', function(){
        showHideCat('Fun');
    })

     //show unshow chore categories
    $(document).on('click', '#Chores', function(){
        showHideCat('Chores');
    })

     //show unshow hobby categories
    $(document).on('click', '#Hobby', function(){
        showHideCat('Hobby');
    })

      //show unshow other categories
    $(document).on('click', '#Other', function(){
        showHideCat('Other');
    })

    $(document).on('click', '.sub-checkbox', function(e) {
        console.log($(this).parent())

        for (i = 0; i < subtasks.length; i++){
            if (subtasks[i].id == e.target.id) {
                if($(this).is(':checked')) {
                    subtasks[i].completed = true;
                }
                else {
                    subtasks[i].completed = false;
                }
                
                $.ajax(
                {
                    url: "http://localhost:3000/modify_sub_tasks",
                    async: true,
                    type: "POST",
                    data: subtasks[i],
                    success: function (result) {
                    }
                });
            }
        }

    })



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
                var badge;
                taskName = $('#tName').val();
                if($('#dury').val() == ""){
                    dury = 1;
                }else {
                    dury = $('#dury').val();
                }
                category = $("#category").val();
                repeat = $('#repeat').val();
                dueDate = $('#dueDate').val();
                priority = $('#priority').val();



                let new_task = {name: taskName, duration: dury, category: category, repeat: repeat, dueDate: dueDate};

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
                for(i = 0; i < categories.length; i++){
                    if(categories[i].cat == category) {
                       $("#list").append("<div class='task-drag' style='background: " + categories[i].color + 
                            "' data-taskid=" + new_task.id + "><label style='width:50%'>" + taskName + 
                            "</label>" + getBadge(new_task.repeat) +
                           "<img id='removeBin1' src='../rubbish-bin.png'   style='float: right; visibility:hidden;' width='16'/> " +
                            "<img src='../gap.png'   style='float: right; visibility:hidden;' width='6'/>" +
                            "<img id='edit1' src='../edit-icon.png'   style='float: right; visibility:hidden;' width='16'/>"+

                            "</div>");
                   }
                }
                refreshModal();
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
        $("#editModal").modal("hide");
        $('#taskModal').modal("hide");
    });

    //Activate textfield when modal is shown//
    $('#myModal').on('shown.bs.modal', function () {
        $('#tName').focus();
    });

    // updating edited task in calendar
    // when submit edits button pressed
    //Remember to change this for tasks longer than 24 hours

    $(function() {
        $(".editButton").click(function() {
            var name = $('#editName').val();
            var hours = $('#editDury').val();
            var category = $('#editCat').val();
            //var due_date = $('#newDate').val();
            var repeat = $('#editRepeat').val();
            var start = new Date(element.start);
            var end_date = new Date(start.getTime() + (60000 * 60 * hours));
            end_date = end_date.toISOString().split('.', 1)[0];


            element.title = name;
            element.duration = hours;
            element.cat = category;
            element.end = end_date;
            element.repeat = repeat;



            switch(category) {
                case "University":
                    element.color = '#6578a0';
                    break;
                case "Work":
                    element.color = '#84b79d';
                    break;
                case "Fun":
                    element.color = '#ffc53f';
                    break;
                case "Chores":
                    element.color = '#e5a190';
                    break;
                case "Hobby":
                    element.color = '#c18fe8';
                    break;
                case "Other":
                    element.color = 'grey';
            }

            for (i = 0; i < calendarEvents.length; i++) {
                if (calendarEvents[i].id == element.id) {
                    calendarEvents[i] = element;
                }
            }

            $('#editModal').modal("hide");
            $('#calendar').fullCalendar('updateEvent', element);
            console.log(calendarEvents)

            id = element.id;
            data = {
                id: id,
                newName: name,
                newDury: hours,
                newCat: category,
                //newDue: dueDate,
                end: end_date.split('T')[1],
                repeat: repeat,
                parent: element.parent_task
            }



            $.ajax(
                {
                    url: "http://localhost:3000/edit_cal_task",
                    async: true,
                    type: "POST",
                    data: data,
                    success: function (result) {
                        console.log("successfully added");
                    }
                });

        });
    });

    // saves edits to task list when edit button clicked
    $(function() {
        $(".editTButton").click(function() {
            var name = $('#editTName').val();
            var hours = $('#editTDury').val();
            var category = $('#editTCat').val();
            var due_date = $('#newTDate').val();
            var repeat = $('#editTRepeat').val();

            if(due_date == '') {
                due_date = curTask.dueDate;
            //    element.due_date = due_date;
            }
            //alert(due_date)

            //hide edit modal
            $('#taskModal').modal("hide");
            //hide data time picker data
            $("#datetimepicker2").data("DateTimePicker").hide();

            // update allEvents array
            for (var i = 0; i < allEvents.length; i++) {
                if (curTask.id == allEvents[i].id) {
                    allEvents[i].name = name;
                    allEvents[i].duration = hours;
                    allEvents[i].category = category;
                    allEvents[i].repeat = repeat;
                    allEvents[i].dueDate = due_date;
                }
            }

            //update html of task list
            $("[data-taskid=" + curTask.id +"] label").text(name);

            switch(category) {
                case "University":
                    color = '#6578a0';
                    break;
                case "Work":
                    color = '#84b79d';
                    break;
                case "Fun":
                    color = '#ffc53f';
                    break;
                case "Chores":
                    color = '#e5a190';
                    break;
                case "Hobby":
                    color = '#c18fe8';
                    break;
                case "Other":
                    color = 'grey';
            }

            $("[data-taskid=" + curTask.id +"]").css('background', color);

            //update database
            $.ajax(
            {
                url: "http://localhost:3000/edit_task",
                async: true,
                type: "POST",
                data: {
                    id: curTask.id,
                    name: name,
                    dury: hours,
                    cat: category,
                    repeat: repeat,
                    dueDate: due_date
                },
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

    $.getJSON('/load_subtasks', function(data) {
        $.each(data, function(key, val) {
            let subTask = {
                id: val.task_id,
                parent: val.parent_task_id,
                description: val.description,
                completed: val.completed

            }
            subtasks.push(subTask);
        })
    })



    /* initialize the external events
    -----------------------------------------------------------------*/
    // get tasks in database and add to task list

    $.getJSON('/tasks', function(data){
        // get each task description in database

        
        $.each(data, function(key, val){
            if(val.in_calendar==true) {
                return;
            }
            let description = val.description;

            let newTask = {id: val.item_id, name: description, duration: val.num_hours, 
                category: val.category, priority: val.priority, dueDate: val.due_date, repeat: val.repeat};



            //let newTask = {name: description, duration: val.num_hours, category: val.category, repeat: val.repeat, dueDate: val.due_date};
            allEvents.push(newTask);
            // create new task with description
            let category = newTask.category;


            for(i = 0; i < categories.length; i++){
                if(categories[i].cat == category) {
                    $("#list").append("<div class='task-drag' style='background: " + categories[i].color + 
                        "' data-taskid=" + newTask.id + "><label style='width:50%'>" + description + 
                        "</label>" + getBadge(newTask.repeat) +
                        "<img id='removeBin1' src='../rubbish-bin.png'   style='float: right; visibility:hidden;' width='16'/> " +
                        "<img src='../gap.png'   style='float: right; visibility:hidden;' width='6'/>" +
                        "<img id='edit1' src='../edit-icon.png'   style='float: right; visibility:hidden;' width='16'/>"+
                        "</div>");
                }
            }
//             if (category == "University") {
//                 $("#list").append("<div class='task-drag' style='background: #6578a0' data-taskid=" + newTask.id + "><label style='width:50%'>" + description + "</label>" + "<img id='removeBin1' src='../rubbish-bin.png'   style='float: right; visibility:hidden;' width='16'/> " +
//                     "\<img id='edit1' src='../gap.png'   style='float: right; visibility:hidden;' width='6'/>" +
//                     "<img id='edit1' src='../edit-icon.png'   style='float: right; visibility:hidden;' width='16'/>"+
//                     getBadge(newTask.repeat) +
//                     "</div>");
//             } else if (category == "Work") {
//                 $("#list").append("<div class='task-drag' style='background: #84b79d' data-taskid=" + newTask.id + "><label style='width:50%'>" + description + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; visibility:hidden;' width='16'/>" +
//                     "\<img id='edit1' src='../gap.png'   style='float: right; visibility:hidden;' width='6'/>" +
//                     "<img id='edit1' src='../edit-icon.png'   style='float: right; visibility:hidden;' width='16'/>" +
//                     getBadge(newTask.repeat) +
//                     "</div>");
//             } else if (category == "Fun") {
//                 $("#list").append("<div class='task-drag' style='background: #ffc53f' data-taskid=" + newTask.id + "><label style='width:50%'>" + description + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; visibility:hidden;' width='16'/>" +
//                     "\<img id='edit1' src='../gap.png'   style='float: right; visibility:hidden;' width='6'/>" +
//                     "<img id='edit1' src='../edit-icon.png'   style='float: right; visibility:hidden;' width='16'/>"+
//                     getBadge(newTask.repeat) +
//                     "</div>");
//             } else if (category == "Chores") {
//                 $("#list").append("<div class='task-drag' style='background: #e5a190' data-taskid=" + newTask.id + "><label style='width:50%'>" + description + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; visibility:hidden;' width='16'/>" +
//                     "\<img id='edit1' src='../gap.png'   style='float: right; visibility:hidden;' width='6'/>" +
//                     "<img id='edit1' src='../edit-icon.png'   style='float: right; visibility:hidden;' width='16'/>" +
//                     getBadge(newTask.repeat) +
//                     "</div>");
//             } else if (category == "Hobby") {
//                 $("#list").append("<div class='task-drag' style='background: #c18fe8' data-taskid=" + newTask.id + "><label style='width:50%'>" + description + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
//                     "\<img id='edit1' src='../gap.png'   style='float: right; visibility:hidden;' width='6'/>" +
//                     "<img id='edit1' src='../edit-icon.png'   style='float: right; visibility:hidden;' width='16'/>"+
//                     getBadge(newTask.repeat) +
//                     "</div>");
//             } else if (category == "Other") {
//                 $("#list").append("<div class='task-drag' style='background: grey' data-taskid=" + newTask.id + "><label style='width:50%'>" + description + "</label><img id='removeBin1' src='../rubbish-bin.png'   style='float: right; display:none;' width='16'/>" +
//                     "\<img id='edit1' src='../gap.png'   style='float: right; visibility:hidden;' width='6'/>" +
//                     "<img id='edit1' src='../edit-icon.png'   style='float: right; visibility:hidden;' width='16'/>"+
//                     getBadge(newTask.repeat) +
//                     "</div>");
//             }
        });
    });

    // get each calendar item description in database
    $.getJSON('/load_cal_items', function(data){
        $.each(data, function(key, val){
            let date = val.yyyymmdd;

            let duration = val.num_hours;
            let parent = val.parent_task_id;
            let date_split = date.split();
            let timeless_date = date_split[0];
            let start_date = timeless_date+'T'+val.start_time;

            let num1 =Math.floor(duration/24);
            let extraHours = duration % 24;

            let dayendTime =moment(start_date).add(num1, 'days').format();
            let newdayendTime =moment(dayendTime).add(extraHours, 'hours').format();

            let end_date = newdayendTime.substr(0,19);

            
            let due_date = val.due_date;
            let repeat = val.repeat;
            let note = val.notes;
            let complete = val.complete;
            let newEvent = {
                title: val.description,
                id: val.item_id,
                start: start_date,
                end: end_date,
                parent_task: parent,
                duration: val.num_hours,
                cat: val.category,
                due_date: due_date,
                repeat: repeat,
                note: note,
                complete: complete
            };
            switch(newEvent.cat) {
                case "University":
                    newEvent.color = '#6578a0';
                    break;
                case "Work":
                    newEvent.color = '#84b79d';
                    break;
                case "Fun":
                    newEvent.color = '#ffc53f';
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
            var numofEvents = 0;
            if(newEvent.repeat == "None" || newEvent.repeat == null){
                calendarEvents.push(newEvent);
            }else {
                while (numofEvents < 300){    
                        
                    var myEvent = Object.assign({}, newEvent);
                    myEvent.start = moment(newEvent.start).add(numofEvents,newEvent.repeat).format().split("+", 1).toString();
                    myEvent.end = moment(newEvent.end).add(numofEvents, newEvent.repeat).format().split("+", 1).toString(); 
                    numofEvents++;
                    //console.log(myEvent);
                    calendarEvents.push(myEvent);
                }
            }
        });
        $('#calendar').fullCalendar('renderEvents', calendarEvents, 'stick');
    });

    $('#list').sortable(
        {
            items: ".task-drag",
            opacity: .6,
            placeholder: 'placeholder',

            helper:   'clone',


            start:function(event,ui){ 

                thisId = ui.item.attr('data-taskid'); 
                eventDuration = getDuration2(thisId);

                shadowEvents = []; 
                today = getToday(); 
                day = parseInt(today.substr(8,10));
                yearandmonth = today.substr(0,8);
                x = 0; 

                //Add the dates from this week to be compared. 
                datesOfInterest = getDaysThisWeek(day,yearandmonth);
                //Getting the events for this week 
                alleventeroos = $('#calendar').fullCalendar( 'clientEvents', function(evt) {
                currentDate = evt.start.format(); 
                current = currentDate.substr(0,10);
                result = datesOfInterest.includes(current); 
                return result; 
                });

                alleventeroos = sortByDate(alleventeroos); 

                //Starting Daily Iteration 
                for(dayeroo=0; dayeroo<7; dayeroo++){

                    console.log(dayeroo + "yeah");
                    currentDay = datesOfInterest[dayeroo];
                    eventsOfInterest = getTodaysevents(alleventeroos,currentDay); 
                    eventsOfInterest = sortByDate(eventsOfInterest);
                    startDate = currentDay.substr(0,10);
                    starttime = 0; 
                    blahtime = 0; 
            
                    hours = 0; 
                    start = true;
                    isZero = true; 
                    addedDuration = false; 

                    for (h = 0; h < 48; h ++){

                        if (addedDuration == true){
                            h = h-1;
                        }

                        odd = false; 
                        minscompare = 0; 

                        if(isOdd(h)){
                           minscompare = 30; 
                           odd = true;
                        }
                        else{
                            minscompare = 0; 
                        }

                        if (odd == false && isZero == true){
                            //console.log("setting isZero True");
                            isZero = false; 
                        }
                        else if(odd == false && isZero == false && addedDuration == false){
                            //console.log("incrementing hours");
                            hours = hours + 1;
                            //console.log("adding here");
                        }
                        else{
                            //Do nothing?
                            isZero = false;
                        }

                        addedDuration = false; 

                        for(index = 0; index < eventsOfInterest.length; index ++){

                            currentEventTime = getHoursFormat(eventsOfInterest, index);
                            mins = getMinutesFormat(eventsOfInterest, index);
                        

                            if(currentEventTime == hours && mins == minscompare){

                            stringhours = calculateStartTime(h);
                            stringstarttime = calculateStartTime(blahtime); 
                            totalDate = startDate + "T" + stringstarttime;
                            totalEnd = startDate + "T" + stringhours;
                            newEvent = createEvent(totalDate,totalEnd);
                            duration = calculateDuration(eventsOfInterest,index,totalEnd);
                            tdawg = (h - blahtime)/2;
                            if((h - blahtime)/2 >= eventDuration){
                                shadowEvents.push(newEvent);
                            }
                            else{
                                    //Do nothing
                            }
                            h = h + (duration * 2); 
                            hours = hours + duration; 
                            addedDuration = true;
                            starttime = hours;
                            blahtime = h; 

                        }// End of the if 
                            console.log("hmm");


                        } // End of all events 

                        //console.log(h);



                    } // End of hours 

                    if (hours == 25){
                        hours = 24;
                   }

                    stringhours = calculateStartTime(h);
                   stringstarttime = calculateStartTime(blahtime); 
                   totalDate = startDate + "T" + stringstarttime;
                   totalEnd = startDate + "T" + stringhours;


                   q = currentDay + "T" + stringstarttime; 
                    x = currentDay + "T" + stringhours; 

                    //End Reformatting 
                    newEventEnd = createEvent(q,x);
                   shadowEvents.push(newEventEnd);


                } // End of days 

                $('#calendar').fullCalendar( 'renderEvents', shadowEvents , 'stick');

                    
            },
            stop:function(){
                $('#calendar').fullCalendar( 'removeEvents', 66666);


            },

            update: function(event, ui) {
                //console.log($( "#list" ).sortable( "toArray" ));
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
        fixedWeekCount: false,
        aspectRatio: 2,
        editable: true,
        droppable: true, // this allows things to be dropped onto the calendar
        dragRevertDuration: 0,
        drop: function(date, jsEvent, ui) {
            //console.log($(this));
            
            //console.log(jsEvent);
            //console.log(ui);
            let task_id = $(this)[0].dataset.taskid;
            let event_name = $(this)[0].firstChild.innerText;
            var category;
            var duration_ms;
            var startTime;
            var endTime;
            var dueDate;
            var priority;
            var time;
            var repeat;
            for (var i = 0; i < allEvents.length; i++) {
                if (task_id == allEvents[i].id) {
                    time = allEvents[i].duration;
                    category = allEvents[i].category;
                    startTime = date.format();
                    duration_ms = time*60*60*1000;
                    endTime = date.clone().add(duration_ms).format();
                    dueDate = allEvents[i].dueDate;
                    priority = allEvents[i].priority;
                    repeat = allEvents[i].repeat;
                    allEvents.splice(i,1);
                }
            }
            //Put time in appropriate format (IOString) for insertion into the database


            let end;
            let numofDays;
            let extraHours
            let start_split = startTime.split('T');
            if(!start_split[1]) {
                startTime = startTime+"T09:00:00";
                end = parseInt(time);
            }else {
                end = parseInt(time);

            }
            numofDays =Math.floor(end/24);
            extraHours = end % 24;
            
            let dayendTime =moment(startTime).add(numofDays, 'days').format();
            let newdayendTime =moment(dayendTime).add(extraHours, 'hours').format();

            endTime = newdayendTime.substr(0,19);

            let newCalEvent = {title: event_name, duration: duration_ms, cat: category, start: startTime, end: endTime,
                parent_task: task_id, due_date: dueDate, priority: priority, repeat: repeat, complete: false};

            switch(newCalEvent.cat) {
                case "University":
                newCalEvent.color = '#6578a0';
                    break;
                case "Work":
                newCalEvent.color = '#84b79d';
                    break;
                case "Fun":
                newCalEvent.color = '#ffc53f';
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


            $.ajax({
                url: "http://localhost:3000/new_cal_task",
                async: false,
                type: "POST",
                data: newCalEvent,
                success: function (result) {
                    newCalEvent.id  = JSON.parse(result);
                    newCalEvent.duration=duration_ms/(60*60*1000);
                }
            });

            var recurringEvents = [];  
            var numofEvents = 0;
            var time = startTime;
            if(newCalEvent.repeat == null || newCalEvent.repeat == "None"){
                calendarEvents.push(newCalEvent);
                recurringEvents.push(newCalEvent);
            }else{
                while (numofEvents < 300){
                    var repeatstarttime = moment(startTime);
                    var repeatendtime = moment(endTime);
                    
                    var myEvent = Object.assign({}, newCalEvent);


                    newstartTime = repeatstarttime.add(numofEvents, newCalEvent.repeat).format();
                    newendTime =  repeatendtime.add(numofEvents, newCalEvent.repeat).format();


                    myEvent.start = newstartTime.substr(0,19);
                    
                    myEvent.end = newendTime.substr(0,19);
                    numofEvents++;

                    calendarEvents.push(myEvent);
                    
                    recurringEvents.push(myEvent);
                }
            }

            $('#calendar').fullCalendar( 'addEventSource', recurringEvents);
            
                
            
           
            
            // calendarEvents.push(newCalEvent);
            $(this).remove();
            // $('#calendar').fullCalendar('renderEvent', newCalEvent, 'stick');
            //$('#calendar').fullCalendar('removeEvents', newCalEvent.id);
        },

        //When mouse hovers over


        eventDragStart: function( event, jsEvent, ui, view ) {
            dragging = true;
            $('.popover').popover('hide');
            //console.log("Cry")

        },




        //on EventClick
        eventClick: function (calEvent, jsEvent, view) {
            //closePopovers();
            

            popoverElement = $(jsEvent.currentTarget);
            element = calEvent;

            $(".popover").each(function() {
                //console.log($(this));
                $(this).popover().remove();
            });

            popoverElement.popover('show');
            ($(".subtasklist").children().remove());

            for (i = 0; i < subtasks.length; i++) {
                if (subtasks[i].parent == element.id) {
                    //alert(subtasks[i].completed)
                    if (subtasks[i].completed == true) {
                        //alert(true)
                        $(".subtasklist").append('<li class="subtask"><input type="checkbox" checked="checked"' + 
                            'id=' + subtasks[i].id + ' class="sub-checkbox"  ><div class="subtasklabel" >'+ 
                            subtasks[i].description +'</div></li>');
                    } else {
                        $(".subtasklist").append('<li class="subtask"><input type="checkbox" ' + 
                            'id=' + subtasks[i].id + ' class="sub-checkbox"><div class="subtasklabel">'+ 
                            subtasks[i].description +'</div></li>');

                    }
     
                }
            }

            // for (i = 0; i < subtasks.length; i++) {
            //     if (subtasks[i].parent == element.id) {
            //         $(".subtasklist").append('<li class="subtask"><input type="checkbox" ' + 
            //             'id=' + subtasks[i].id + ' class="sub-checkbox"><div class="subtasklabel">'+ 
            //             subtasks[i].description +'</div></li>');

            //     }
            // }
            console.log(subtasks)

            $('#notes').val(element.note);



            popoverElement.dblclick(function () {
                if (element.complete){
                    popoverElement.popover('enable');
                    element.editable = true;
                    element.complete = false;
                    popoverElement.fadeTo('slow', 1);
                    $('#calendar').fullCalendar('updateEvent', element);
                    $.ajax(
                    {
                        url: "http://localhost:3000/event_complete",
                        async: true,
                        type: "POST",
                        data: {
                            id: element.id,
                            complete: false
                        },
                        success: function (result) {
                            console.log("successlly completed event")
                        }
                    });
                }
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
                    trigger:'manual'
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
            var repeat = false;
            dragging = false;
            for (let i=0; i<calendarEvents.length; i++) {
                if(calendarEvents[i].id==event.id) {
                    justDragged.push(calendarEvents[i]);
                }
            }
            var external_events = $( ".tabcontent" );
            var offset = external_events.offset();
            offset.right = external_events.width() + offset.left;
            offset.bottom = external_events.height() + 200 + external_events.position().top;

            if (jsEvent.pageX >= offset.left
                && jsEvent.pageY >= external_events.position().top
                && jsEvent.pageX <= offset.right
                && jsEvent.pageY <= offset.bottom
            ) {
                let task_id=0;
                var firstrepeat = false;
                // alert("inside");
                for(let i=0; i<calendarEvents.length; i++) {
                    if(calendarEvents[i].id==event.id) {
                        

                        let id=calendarEvents[i].id;
                        let parent=calendarEvents[i].parent_task;
                        task_id=parent;
                        //console.log("THE FOLLOWING TASK HAS BEEN ADDED BACK TO THE TASK LIST");
                        let newTask = {id: parent, name: calendarEvents[i].title,
                            duration: calendarEvents[i].duration, category: calendarEvents[i].cat,
                            repeat: calendarEvents[i].repeat, dueDate: calendarEvents[i].due_date};
                        console.log(newTask);

                        allEvents.push(newTask);
                        calendarEvents.splice(i, 1);
                        justDragged.pop();
                        let category = newTask.category;
                        if(!firstrepeat){
                           

                            $.ajax(
                                {
                                    url: "http://localhost:3000/remove_cal_task",
                                    async: true,
                                    type: "POST",
                                    data: {id: id, parent_id: parent},
                                    success: function (result) {
                                        //console.log("successfully removed calendar task");
                                    }
                                }); 


                            for(i = 0; i < categories.length; i++){
                                if(categories[i].cat == category) {

                                    $("#list").append("<div class='task-drag' style='background: " + categories[i].color + 
                                        "' data-taskid=" + newTask.id + "><label style='width:50%'>" + newTask.name + 
                                        "</label>" + getBadge(newTask.repeat) +
                                        "<img id='removeBin1' src='../rubbish-bin.png'   style='float: right; visibility:hidden;' width='16'/> " +
                                        "<img src='../gap.png'   style='float: right; visibility:hidden;' width='6'/>" +
                                        "<img id='edit1' src='../edit-icon.png'   style='float: right; visibility:hidden;' width='16'/>"+
                                        "</div>");
                                }
                            }  

                            firstrepeat = true;
                        }
                        $('#calendar').fullCalendar('removeEvents', event._id);

                        $("#list").sortable('refresh');
                    }
                }

            }

        },



    });



});

//document.load();


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

var curTask;

var categories = [
    {cat: 'University', color: '#6578a0'},
    {cat:'Work', color: '#84b79d'},
    {cat:'Fun', color: '#c3c60b'},
    {cat:'Chores', color: '#e5a190'},
    {cat:'Hobby', color: '#c18fe8' },
    {cat:'Other', color: 'grey'}

]

//Validates AddTask Modal//
function validateForm() {
    var x = document.forms["myForm"]["fname"].value;
    var y = document.forms["myForm"]["duration"].value;
    var valid = true;
    if (x == "") {
        $('#hiddenText').show();
        valid = false;
    }

    if (isNaN(y)){
        
        $('#hiddenDuration').show();
        valid = false;
    }
    
    return valid;
}






// $('wrap').on('click','#toggle',function (e) {
//   console.log(element);
//   alert('yes');
//   $(".circle-loader").toggleClass("load-complete");
//   $(".checkmark").toggle();
//   $("#showCompleted").slideToggle('slow',    taskCompleted());
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
        popoverElement.popover('disable');
    }, 800);

    element.editable = false;
    element.complete = true;
    

    popoverElement.fadeTo('slow', 0.5);
    $('#calendar').fullCalendar('updateEvent', element);
    $.ajax(
    {
        url: "http://localhost:3000/event_complete",
        async: true,
        type: "POST",
        data: {
            id: element.id,
            complete: true
        },
        success: function (result) {
            console.log("successlly completed event")
        }
    });

}

function closePopovers() {
    $('.popover').not(this).popover('hide');
}

function refreshModal (){
    $('#tName').val('');
    $('#dury').val('');
    $('#hiddenText').hide();
    $('#hiddenDuration').hide();
    $('#repeat').prop('selectedIndex',0);
    $('#category').prop('selectedIndex',0);
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
        //alert("Inside");
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


function createEvent(start,end){

  var newEvent = {
                    title: 'New Background Event',
                    id : 66666,
                    start: start,
                    end: end ,
                    rendering:'background'  };

  return newEvent;
}

function sortByDate(calendarArray){

  calendarArray.sort(function(a,b){
    return new Date(b.start) - new Date(a.start); 
  });

  calendarArray.reverse(); 

  return calendarArray; 
}

function getTodaysevents(alleventeroos, currentDay){

  eventsOfInterest = []; 

//Adding today's events to a list
for(y=0;y<alleventeroos.length; y++){
    newDay = alleventeroos[y].start.format();
    newDay = newDay.substr(0,10);
    if(newDay == currentDay){
          eventsOfInterest.push(alleventeroos[y]);
          }
    }

    return eventsOfInterest; 
}

function getDaysThisWeek(day,yearandmonth){

  datesOfInterest = []; 
  x = 0; 
  console.log("The days for this week are");
  month = parseInt(yearandmonth.substr(5,6));
  //console.log("The month is " + month);
  year = parseInt(yearandmonth.substr(0,4));
  //console.log("The year is " + year);
  newDay = day - 1; 


  while(x<7){
    //console.log("New day is " + newDay + " + " + x); 
    newDay = newDay + 1; 
    //console.log("New month is " + month);

    x = x + 1; 
    if(newDay > 31){

        if ( month == 1 || month == 3 || month ==  5 ||  month == 7 || month ==  8 || month == 10 || month == 12){
        //console.log("Entering if as newDay is " + newDay);
            newDay = 1;
            month = month + 1; 
            if(month > 12){
                month = 1; 
            }
        }

    } 
   
   if (newDay > 30 ){
    if(month == 2 || month == 4 || month == 6 || month == 9 || month == 11){
        newDay = 1;
        month = month + 1; 
        if (month > 12){
            month = 1;
        }
    }

   }
   if(newDay < 10){
    newDay = "0" + String(newDay); 
   }
   if (month < 10){
    month = "0" + String(month);
   }

    wholeNewDate = String(year) + "-" + String(month) + "-" + String(newDay);
    datesOfInterest.push(wholeNewDate);
    console.log(wholeNewDate); 
    newDay = parseInt(newDay);
    month = parseInt(month); 

  }

  return datesOfInterest; 
}

//This is correct. Get's today's date. 
function getToday(){
  var moment = $('#calendar').fullCalendar('getDate');
  today = moment.format(); 
  today = today.substr(0,10);

  //console.log("Today is " + today);

  return today; 
}

function getCurrentTimeFormat(eventsOfInterest, index){
  currentEventDate = eventsOfInterest[index].start.format();
  currentEventTime = parseInt(currentEventDate.substr(11,12)); 
  return currentEventTime; 
}

function stringifyNumbers(hours){

  if(hours < 10){ 
    stringhours = "0" + String(hours);
  }
  else{ 
    stringhours = String(hours);
  }

  return stringhours; 
}

function calculateDuration(eventsOfInterest,index,totalEnd){
    //console.log(eventsOfInterest.length + "bLAH");
    //console.log(eventsOfInterest[index]);

  endtime = eventsOfInterest[index].end.format(); 
  starter = parseInt(totalEnd.substr(11,11));
  ender =   parseInt(endtime.substr(11,13));
  //console.log("Duration is calculated as " + endtime + " - " + totalEnd);
  duration = ender - starter; 
  return duration; 
}

function getDuration(eventTitle){
  for (x = 0; x < allEvents.length; x++){
    if (allEvents[x].title == eventTitle){
      duration = allEvents[x].duration; 
      break;
    }
  }

  return duration; 
}

function getDuration2(eventID){

  for (x = 0; x < allEvents.length; x++){
    if (allEvents[x].id == eventID){
      duration = allEvents[x].duration; 
      //console.log("The event ID is " + eventID + " and the name is " + allEvents[x].name);
      //console.log("with a duration of " + duration);
      break;
    }
  }

  return duration; 
}

function addAll(){

  listEvents = getListEvents(); 

  for (x=0; x<listEvents.length; x++){
    //console.log(listEvents[x].name);
  }

}

function getListEvents(){

  calendarEvents = $('#calendar').fullCalendar( 'clientEvents'); 
  listEvents = []; 

  for (x = 0; x<allEvents.length; x++){
    //console.log("allEventsLength is " + allEvents.length);
    exists = false; 
    for(y = 0; y<calendarEvents.length; y++){
      //console.log("allEventsLength is " + allEvents.length);
      if(allEvents[x].name == calendarEvents[x].title){
        exists = true; 
      }

    }

    if (exists == false){
      listEvents.push(allEvents[x]); 
    }
  }

  return listEvents; 
}

function removeCategory(category){
    console.log(calendarEvents)
    for (i = 0; i < calendarEvents.length; i++){
        if(calendarEvents[i].cat == category) {
            //alert(calendarEvents[i].cat + " " + category)
            $('#calendar').fullCalendar('removeEvents', calendarEvents[i].id);
        }
    }  
}

function addBackCategory(category) {
    for (i = 0; i < calendarEvents.length; i++){
        if(calendarEvents[i].cat == category) {
            $('#calendar').fullCalendar('renderEvent', calendarEvents[i], 'stick');
        }
    } 
}

function showHideCat(category){
    categoryID = "#" + category
    if($(categoryID).is(':checked')) {
        addBackCategory(category);
    }
    else{
        removeCategory(category);
    }
}

function getBadge(repeatValue){
    var badge;
    if (repeatValue == "week"){
        badge = "<span class='badge' style='float: right; background-color: #f0ad4e;'>W</span>";
    }else if (repeatValue == "month"){
        badge = "<span class='badge' style='float: right; background-color: #1864dd'>M</span>";
    }else if (repeatValue == "year"){
        badge = "<span class='badge' style='float: right; background-color: #59b233'>Y</span>";
    }else if (repeatValue == "day"){
        badge = "<span class='badge' style='float: right; background-color: #db69b1'>D</span>";
    }else{
        badge = "<label class='badge' style='float: right; background-color: transparent; color: transparent;'>X</label>";    }
    return badge;
}


  
function optimise2(){

    //console.log("Initialising the optimiser!");
    //console.log($('#viv_input').val());


    begin = $('#viv_input').val();

    if (!begin){
        begin = 9;
    }

    begin = parseInt(begin);

    end = $('#viv_input2').val();

    if (!end){
        end = 24;
    }

    end = parseInt(end);

    today = getToday(); 
    day = parseInt(today.substr(8,10));
    yearandmonth = today.substr(0,8);
    x = 0; 

    //ADDED CHANGE 
    begin = begin *2; 
    end = end * 2;


    //Add the dates from this week to be compared. 
    datesOfInterest = getDaysThisWeek(day,yearandmonth);

    for (que = 0; que < allEvents.length; que++){

        //console.log("The dury is out " + allEvents[que].duration);

        occ = occupied();
        //console.log(que);
        //console.log(allEvents[que]);


        eventDuration = allEvents[que].duration;

        //ADDED CHANGE 
        eventDuration = eventDuration * 2; 

        //console.log(allEvents[que].name + " is a " + eventDuration + " length event");
        loopday: 
        for(dayeroo=0; dayeroo<7; dayeroo++){
            //Calculate the events of interest for today.
            currentDay = datesOfInterest[dayeroo];
            //console.log(currentDay);

        


            for (hours = begin; hours < end; hours ++){ // For each hour

                //console.log("hours iteration start = " + hours);

                if((eventDuration + hours) > end){
                    //console.log("hours = " + hours);
                    continue;
                }
                //console.log("hours = " + hours);

                add = true; 
                //console.log("hours = " + hours);

                //console.log("Checking a " + eventDuration + " hour lengthed time slot")
                for(d = 0; d < parseInt(eventDuration); d++){
                    //console.log("inside d the value of hours = " + hours);

                    n = hours + d; 
                   // console.log("hours = " + hours);

                    newHour = calculateStartTime(n);
                   // console.log("hours = " + hours);
                    
                    //time = String(newHour)+ ":00:00";
                    checkDate = currentDay + "T" + newHour; 
                    //console.log("hours = " + hours);
                    //console.log("checking " + checkDate);
                    //console.log(checkDate);
                    if(occ.includes(checkDate)){
                        //console.log("hours = " + hours);
                        add = false; 
                    }
                    //if that time is in occupado set add to false; 

                } // End checking the whole duration 

                if (add == true){
                    console.log("hours = " + hours);
                    //ADD EVENT and then break.

                    n = n + 1;
                    //console.log("hours = " + hours);
                    time = calculateStartTime(n);
                    //console.log("hours = " + hours);

                    //newHour = parseInt(newHour);
                    //newHour = newHour + 1; 
                    //if (newHour < 10){
                    //    newHour = "0" + String(newHour);
                    //}

                    //time = String(newHour)+ ":00:00";
                    checkDate = currentDay + "T" + time; 
                   // console.log("hours = " + hours);


                    h = hours;
                    //console.log("hours = " + hours);

                    time = calculateStartTime(h); 
                    //console.log("hours = " + hours);

                    //if (h < 10){
                    //    h = "0" + String(h); 
                   // }

                    //time = String(h)+":00:00"; 
                    startTime = currentDay + "T" + time;
                    startTime = String(startTime); 

                    console.log("Adding an event with starttime " + startTime);
                    console.log(" and an end time of " + checkDate); 


                    event_name = allEvents[que].name;
                    time = allEvents[que].duration;
                    category = allEvents[que].category;
                    
                    //duration_ms = time*60*60*1000;
                    endTime = checkDate;
                    dueDate = allEvents[que].dueDate;
                    priority = allEvents[que].priority;
                    task_id = allEvents[que].id;
                    console.log(startTime,time,category,dueDate,priority);

                    newCalEvent = {title: event_name, duration: time, cat: category, start: startTime, end: endTime,
                        parent_task: task_id, due_date: dueDate, repeat: 'None'};

                    //console.log("2 checking on the value of hours = " + hours);    
                        
                    switch(newCalEvent.cat) {
                        case "University":
                        newCalEvent.color = '#6578a0';
                        break;
                        case "Work":
                        newCalEvent.color = '#84b79d';
                        break;
                        case "Fun":
                        newCalEvent.color = '#ffc53f';
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
                    // BE SURE TO UNCOMMENT THIS SECTION. ONLY COMMENTED FOR TESTING PURPOSES.
                   
                    $.ajax({
                        url: "http://localhost:3000/new_cal_task",
                        async: false,
                        type: "POST",
                        data: newCalEvent,
                        success: function (result) {
                            newCalEvent.id  = JSON.parse(result);
                            //newCalEvent.duration=duration_ms/(60*60*1000);
                        }
                    });
                    
                    calendarEvents.push(newCalEvent);
                    //console.log("1 checking on the value of hours = " + hours);

                    //console.log(newCalEvent.title,newCalEvent.color, newCalEvent.start, newCalEvent.end);
                    //Beni and Lauren - New event is added here to the calendar

                    $('#calendar').fullCalendar('renderEvent', newCalEvent, 'stick');


                    //console.log(" OK checking on the value of hours = " + hours);

                    break loopday;


                }//End if add is true. 

               // console.log("at the end hours = " + hours);


            } // End Iterating hours 


        } // End Iterating Days


    } //End Iterating through task list 

    //Beni and lauren, all tasks are deleted from the calendar here. 

    $("#list .task-drag").each(function(){
        //console.log("lol"); 
        $(this).remove(); 
    });
    allEvents = []; 

} // End Optimise Function 


function occupied(){
    occupado = [];
    //console.log("Broken?");
    today = getToday(); 
    day = parseInt(today.substr(8,10));
    yearandmonth = today.substr(0,8);

    //Add the dates from this week to be compared. 
    datesOfInterest = getDaysThisWeek(day,yearandmonth);

    alleventeroos = $('#calendar').fullCalendar( 'clientEvents', function(evt) {
        currentDate = evt.start.format(); 
        current = currentDate.substr(0,10);
        result = datesOfInterest.includes(current); 
        return result; 
    });

    for (x=0; x<alleventeroos.length; x++){
        //console.log(alleventeroos[x].start.format());
        duration = alleventeroos[x].duration;
        //console.log(alleventeroos[x].end.format());


        date = alleventeroos[x].start.format().substr(0,10);
        time = alleventeroos[x].start.format().substr(11,13);

        hours = parseInt(alleventeroos[x].start.format().substr(11,2)); 
        mins = parseInt(alleventeroos[x].start.format().substr(14,2));

        hours = hours * 2;

        if (mins == 30){
            hours = hours + 1;
        }

        for (y = 0; y < parseInt(duration)*2; y++){

            time = calculateStartTime(hours);



            momento = date + "T" + time;
             occupado.push(momento);

            hours = hours + 1;
        }

    }


    return occupado; 


}

function priorityOptimise(){

    eventList = getPriorityList();
    allEvents = [];
    allEvents = eventList;
    //console.log("Initialising the optimiser!");
    //console.log($('#viv_input').val());


   begin = $('#viv_input').val();

    if (!begin){
        begin = 9;
    }

    begin = parseInt(begin);

    end = $('#viv_input2').val();

    if (!end){
        end = 24;
    }

    end = parseInt(end);

    today = getToday(); 
    day = parseInt(today.substr(8,10));
    yearandmonth = today.substr(0,8);
    x = 0; 

    //ADDED CHANGE 
    begin = begin *2; 
    end = end * 2;


    //Add the dates from this week to be compared. 
    datesOfInterest = getDaysThisWeek(day,yearandmonth);

    for (que = 0; que < allEvents.length; que++){

        //console.log("The dury is out " + allEvents[que].duration);

        occ = occupied();
        //console.log(que);
        //console.log(allEvents[que]);


        eventDuration = allEvents[que].duration;

        //ADDED CHANGE 
        eventDuration = eventDuration * 2; 

        //console.log(allEvents[que].name + " is a " + eventDuration + " length event");
        loopday: 
        for(dayeroo=0; dayeroo<7; dayeroo++){
            //Calculate the events of interest for today.
            currentDay = datesOfInterest[dayeroo];
            //console.log(currentDay);

        


            for (hours = begin; hours < end; hours ++){ // For each hour

                //console.log("hours iteration start = " + hours);

                if((eventDuration + hours) > end){
                    //console.log("hours = " + hours);
                    continue;
                }
                //console.log("hours = " + hours);

                add = true; 
                //console.log("hours = " + hours);

                //console.log("Checking a " + eventDuration + " hour lengthed time slot")
                for(d = 0; d < parseInt(eventDuration); d++){
                    //console.log("inside d the value of hours = " + hours);
                    
                    n = hours + d; 
                   // console.log("hours = " + hours);

                    newHour = calculateStartTime(n);
                   // console.log("hours = " + hours);
                    
                    //time = String(newHour)+ ":00:00";
                    checkDate = currentDay + "T" + newHour; 
                    //console.log("hours = " + hours);
                    //console.log("checking " + checkDate);
                    //console.log(checkDate);
                    if(occ.includes(checkDate)){
                        //console.log("hours = " + hours);
                        add = false; 
                    }
                    //if that time is in occupado set add to false; 

                } // End checking the whole duration 

                if (add == true){
                    console.log("hours = " + hours);
                    //ADD EVENT and then break.

                    n = n + 1;
                    //console.log("hours = " + hours);
                    time = calculateStartTime(n);
                    //console.log("hours = " + hours);

                    //newHour = parseInt(newHour);
                    //newHour = newHour + 1; 
                    //if (newHour < 10){
                    //    newHour = "0" + String(newHour);
                    //}

                    //time = String(newHour)+ ":00:00";
                    checkDate = currentDay + "T" + time; 
                   // console.log("hours = " + hours);


                    h = hours;
                    //console.log("hours = " + hours);

                    time = calculateStartTime(h); 
                    //console.log("hours = " + hours);

                    //if (h < 10){
                    //    h = "0" + String(h); 
                   // }

                    //time = String(h)+":00:00"; 
                    startTime = currentDay + "T" + time;
                    startTime = String(startTime); 

                    console.log("Adding an event with starttime " + startTime);
                    console.log(" and an end time of " + checkDate); 


                    event_name = allEvents[que].name;
                    time = allEvents[que].duration;
                    category = allEvents[que].category;
                    
                    //duration_ms = time*60*60*1000;
                    endTime = checkDate;
                    dueDate = allEvents[que].dueDate;
                    priority = allEvents[que].priority;
                    task_id = allEvents[que].id;
                    console.log(startTime,time,category,dueDate,priority);

                    newCalEvent = {title: event_name, duration: time, cat: category, start: startTime, end: endTime,
                        parent_task: task_id, due_date: dueDate, repeat: 'None'};

                    //console.log("2 checking on the value of hours = " + hours);    
                        
                    switch(newCalEvent.cat) {
                        case "University":
                        newCalEvent.color = '#6578a0';
                        break;
                        case "Work":
                        newCalEvent.color = '#84b79d';
                        break;
                        case "Fun":
                        newCalEvent.color = '#ffc53f';
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
                    // BE SURE TO UNCOMMENT THIS SECTION. ONLY COMMENTED FOR TESTING PURPOSES.
                   
                    $.ajax({
                        url: "http://localhost:3000/new_cal_task",
                        async: true,
                        type: "POST",
                        data: newCalEvent,
                        success: function (result) {
                            newCalEvent.id  = JSON.parse(result);
                            //newCalEvent.duration=duration_ms/(60*60*1000);
                        }
                    });
                    
                    calendarEvents.push(newCalEvent);
                    //console.log("1 checking on the value of hours = " + hours);

                    //console.log(newCalEvent.title,newCalEvent.color, newCalEvent.start, newCalEvent.end);
                    //Beni and Lauren - New event is added here to the calendar

                    $('#calendar').fullCalendar('renderEvent', newCalEvent, 'stick');


                    //console.log(" OK checking on the value of hours = " + hours);

                    break loopday;


                }//End if add is true. 

               // console.log("at the end hours = " + hours);


            } // End Iterating hours 


        } // End Iterating Days


    } //End Iterating through task list 

    //Beni and lauren, all tasks are deleted from the calendar here. 

    $("#list .task-drag").each(function(){
        //console.log("lol"); 
        $(this).remove(); 
    });
    allEvents = []; 


   
}
function getPriorityList(){
    console.log("Priority Optimise"); 
    listeroos = $('#list').sortable('toArray', {attribute: 'data-taskid'});
    priorityList = []

    for (x = 0; x < listeroos.length; x++){
        //console.log(listeroos[x]);
        for(y = 0; y<allEvents.length; y++){
            if(listeroos[x] == allEvents[y].id){
                console.log(allEvents[y].name);
                priorityList.push(allEvents[y]);

            }
        }
    }


    return priorityList; 
   
}

function dueDateOptimise(){
    eventList = getDueDateList(); 

    //eventList = getPriorityList();
    allEvents = [];
    allEvents = eventList;
    console.log("Initialising the optimiser!");
    console.log($('#viv_input').val());


    begin = $('#viv_input').val();

    if (!begin){
        begin = 9;
    }

    begin = parseInt(begin);

    end = $('#viv_input2').val();

    if (!end){
        end = 24;
    }

    end = parseInt(end);

    today = getToday(); 
    day = parseInt(today.substr(8,10));
    yearandmonth = today.substr(0,8);
    x = 0; 

    //ADDED CHANGE 
    begin = begin *2; 
    end = end * 2;


    //Add the dates from this week to be compared. 
    datesOfInterest = getDaysThisWeek(day,yearandmonth);

    for (que = 0; que < allEvents.length; que++){

        //console.log("The dury is out " + allEvents[que].duration);

        occ = occupied();
        //console.log(que);
        //console.log(allEvents[que]);


        eventDuration = allEvents[que].duration;

        //ADDED CHANGE 
        eventDuration = eventDuration * 2; 

        //console.log(allEvents[que].name + " is a " + eventDuration + " length event");
        loopday: 
        for(dayeroo=0; dayeroo<7; dayeroo++){
            //Calculate the events of interest for today.
            currentDay = datesOfInterest[dayeroo];
            //console.log(currentDay);

        


            for (hours = begin; hours < end; hours ++){ // For each hour

                //console.log("hours iteration start = " + hours);

                if((eventDuration + hours) > end){
                    //console.log("hours = " + hours);
                    continue;
                }
                //console.log("hours = " + hours);

                add = true; 
                //console.log("hours = " + hours);

                //console.log("Checking a " + eventDuration + " hour lengthed time slot")
                for(d = 0; d < parseInt(eventDuration); d++){
                    //console.log("inside d the value of hours = " + hours);
                    
                    n = hours + d; 
                   // console.log("hours = " + hours);

                    newHour = calculateStartTime(n);
                   // console.log("hours = " + hours);
                    
                    //time = String(newHour)+ ":00:00";
                    checkDate = currentDay + "T" + newHour; 
                    //console.log("hours = " + hours);
                    //console.log("checking " + checkDate);
                    //console.log(checkDate);
                    if(occ.includes(checkDate)){
                        //console.log("hours = " + hours);
                        add = false; 
                    }
                    //if that time is in occupado set add to false; 

                } // End checking the whole duration 

                if (add == true){
                    console.log("hours = " + hours);
                    //ADD EVENT and then break.

                    n = n + 1;
                    //console.log("hours = " + hours);
                    time = calculateStartTime(n);
                    //console.log("hours = " + hours);

                    //newHour = parseInt(newHour);
                    //newHour = newHour + 1; 
                    //if (newHour < 10){
                    //    newHour = "0" + String(newHour);
                    //}

                    //time = String(newHour)+ ":00:00";
                    checkDate = currentDay + "T" + time; 
                   // console.log("hours = " + hours);


                    h = hours;
                    //console.log("hours = " + hours);

                    time = calculateStartTime(h); 
                    //console.log("hours = " + hours);

                    //if (h < 10){
                    //    h = "0" + String(h); 
                   // }

                    //time = String(h)+":00:00"; 
                    startTime = currentDay + "T" + time;
                    startTime = String(startTime); 

                    console.log("Adding an event with starttime " + startTime);
                    console.log(" and an end time of " + checkDate); 


                    event_name = allEvents[que].name;
                    time = allEvents[que].duration;
                    category = allEvents[que].category;
                    
                    //duration_ms = time*60*60*1000;
                    endTime = checkDate;
                    dueDate = allEvents[que].dueDate;
                    priority = allEvents[que].priority;
                    task_id = allEvents[que].id;
                    console.log(startTime,time,category,dueDate,priority);

                    newCalEvent = {title: event_name, duration: time, cat: category, start: startTime, end: endTime,
                        parent_task: task_id, due_date: dueDate, repeat: 'None'};

                    //console.log("2 checking on the value of hours = " + hours);    
                        
                    switch(newCalEvent.cat) {
                        case "University":
                        newCalEvent.color = '#6578a0';
                        break;
                        case "Work":
                        newCalEvent.color = '#84b79d';
                        break;
                        case "Fun":
                        newCalEvent.color = '#ffc53f';
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
                    // BE SURE TO UNCOMMENT THIS SECTION. ONLY COMMENTED FOR TESTING PURPOSES.
                   
                    $.ajax({
                        url: "http://localhost:3000/new_cal_task",
                        async: true,
                        type: "POST",
                        data: newCalEvent,
                        success: function (result) {
                            newCalEvent.id  = JSON.parse(result);
                            //newCalEvent.duration=duration_ms/(60*60*1000);
                        }
                    });
                    
                    calendarEvents.push(newCalEvent);
                    //console.log("1 checking on the value of hours = " + hours);

                    //console.log(newCalEvent.title,newCalEvent.color, newCalEvent.start, newCalEvent.end);
                    //Beni and Lauren - New event is added here to the calendar

                    $('#calendar').fullCalendar('renderEvent', newCalEvent, 'stick');


                    //console.log(" OK checking on the value of hours = " + hours);

                    break loopday;


                }//End if add is true. 

               // console.log("at the end hours = " + hours);


            } // End Iterating hours 


        } // End Iterating Days


    } //End Iterating through task list 

    //Beni and lauren, all tasks are deleted from the calendar here. 

    $("#list .task-drag").each(function(){
        //console.log("lol"); 
        $(this).remove(); 
    });
    allEvents = []; 

}

function getDueDateList(){
    console.log("Getting due date");

    dueDateList = sortByDueDate(allEvents);

    for (x=0; x<dueDateList.length; x++){
        console.log(dueDateList[x].dueDate);
        console.log(dueDateList[x].name);
    }


    return dueDateList;
}

function sortByDueDate(calendarArray){
    console.log("hey");

  calendarArray.sort(function(a,b){
    return new Date(b.dueDate) - new Date(a.dueDate); 
  });

  calendarArray.reverse(); 

  return calendarArray; 
}

//function to make all categories in a list to selectable categories
function addCatsToList(categoryList){
    for(i = 0; i < categoryList.length; i++) {
        // $('#category-list').append(categoryList[i].cat + "<input type='checkbox'  id=" + 
        //     categoryList[i].cat + " checked='checked'><br>")
        $('#category-list').append("<input type='checkbox' id=" + categoryList[i].cat +
            " checked='checked'> <button class='tag' style='background-color: " + 
            categoryList[i].color + ";'>" + categoryList[i].cat + "</button><br>")         

    }

}

function isOdd(num) { return num % 2;}


function getHoursFormat(eventsOfInterest, index){
  currentEventDate = eventsOfInterest[index].start.format();
  //console.log("The time is " + currentEventDate);
  time = currentEventDate.substr(11,12).split ( ":" );
  hour = parseInt( time[0].trim() );
   min = parseInt( time[1].trim() );
 // console.log("Hour is " + hour);
  //console.log("Min is " + min);
  currentEventTime = parseInt(currentEventDate.substr(11,12)); 
// console.log("spitting out " + currentEventTime);
  return hour; 
}

function getMinutesFormat(eventsOfInterest, index){
  currentEventDate = eventsOfInterest[index].start.format();
  //console.log("The time is " + currentEventDate);
  time = currentEventDate.substr(11,12).split ( ":" );
  hour = parseInt( time[0].trim() );
   min = parseInt( time[1].trim() );
  //console.log("Hour is " + hour);
  //console.log("Min is " + min);
  currentEventTime = parseInt(currentEventDate.substr(11,12)); 
  //console.log("spitting out " + currentEventTime);
  return min; 
}

function calculateStartTime(hours){
    startTime = 0; 
    add30 = false; 
    starttime = Math.floor(hours/2);
    

   // console.log("input is " + hours); 
   // console.log("Start time = " + starttime);

    if (isOdd(hours)){

        add30 = true; 

    }

    if (starttime < 10){
        //console.log("Less than ten");
        starttime = "0" + String(starttime);
    }

    if(add30){
        //console.log("adding 30 minutes " ); 
        starttime = String(starttime) + ":30:00";
    }
    else{

        starttime = String(starttime) + ":00:00";

    }
   // console.log("returning " + starttime);
    return starttime; 
}
