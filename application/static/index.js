async function add_messages(msg, scroll) {
  if (typeof msg.name !== "undefined") {
    var date = dateNow();
    var formattedDate = moment(date).format('D-MMM-YY HH:mm');

    if (typeof msg.time !== "undefined") {
      var n = msg.time;
    } else {
      var n = formattedDate;
    }
    var global_name = await load_name();

    if (typeof msg.dummy == "undefined"){
      msg.dummy = "Corrupti praesentium temporibus architecto odio repellendus ipsum magnam. Suscipit nisi quasi deleniti. Eos aut tempora distinctio neque dicta. Placeat aut ducimus ducimus repudiandae minima."
    }
    var content =
      '<div class="container" id=container_' + msg.id +'>'+
        '<div class="row align-items-center px-0 mx-0">'+
          '<div class="col col-8 align-top px-0 mx-0">'+
            '<div id="real_' + msg.id + '" class="reals">' + msg.message + '</div><div id="fake_' + msg.id + '">' + msg.dummy +'</div>'+
          '</div>'+
          '<div class="col col-4 buttonscol px-0 mx-0">'+
            '<div class="row justify-content-end box px-0 mx-0 pb-1" id="test"><button class="btn btn-sm btn-info reveal" tabindex="-1" id=' + msg.id + '>'+ msg.name +'</button></div>'+
            '<div class="row justify-content-end box px-0 mx-0 py-1">'+n+'</div>'+
            '<div class="row justify-content-end box px-0 mx-0"><a class="btn btn-sm btn-dark text-white btn-sm delmsg" msg-id=' + msg.id +'>telphanu</a></div>'+
          '</div>'+
        '</div>'+
      '</div>'

  
    var messageDiv = document.getElementById("messages");
    messageDiv.innerHTML += content;
    $(".reals").hide();

  }

  if (scroll) {
    scrollSmoothToBottom("messages");
  }
}

$('#smile').click(function (e) {
  $('#sad').show();
  $('#smile').hide();
  $('#smiletoggle').val('lock');
});

$('#sad').click(function (e) {
  $('#smile').show();
  $('#sad').hide();
  $('#smiletoggle').val('open');
});

$('body').on("mousedown", ".reveal", function (e) {
  toggle = $('#smiletoggle').val();
  console.log(toggle);
  if (toggle == 'open') {
    me = $(this);
    id = me.attr('id');
    $('#fake_' + id).hide();
    $('#real_' + id).show();
  }
});

$('body').on("mouseup", ".reveal", function (e) {
  toggle = $('#smiletoggle').val();
  if (toggle == 'open') {
    me = $(this);
    id = me.attr('id');
    $('#fake_' + id).show();
    $('#real_' + id).hide();
  }
});

$('body').on("click", ".delmsg", function (e) {
  msgid = $(this).attr('msg-id');
  $('#container_' + msgid).hide();
  $.get('/clear_message/' + msgid, function (data) { console.log(data); })
});

async function load_name() {
  return await fetch("/get_name")
    .then(async function (response) {
      return await response.json();
    })
    .then(function (text) {
      return text["name"];
    });
}

async function load_messages() {
  return await fetch("/get_messages")
    .then(async function (response) {
      return await response.json();
    })
    .then(function (text) {
      // console.log(text);
      return text;
    });
}


$(function () {
  $(".msgs").css({ height: $(window).height() * 0.6 + "px" });

  $(window).bind("resize", function () {
    $(".msgs").css({ height: $(window).height() * 0.6 + "px" });
  });
});

function scrollSmoothToBottom(id) {
  var div = document.getElementById(id);
  $("#" + id).animate(
    {
      scrollTop: div.scrollHeight - div.clientHeight,
    },
    500
  );
}

function dateNow() {
  var date = new Date();
  var aaaa = date.getFullYear();
  var gg = date.getDate();
  var mm = date.getMonth() + 1;
  if (gg < 10) gg = "0" + gg;
  if (mm < 10) mm = "0" + mm;
  var cur_day = aaaa + "-" + mm + "-" + gg;
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;
  return cur_day + " " + hours + ":" + minutes;
}

var socket = io.connect("http://" + document.domain + ":" + location.port);
socket.on("connect", async function () {
  var usr_name = await load_name();
  if (usr_name != "") {
    socket.emit("event", {
      message: usr_name + " just connected to the server!",
      connect: true,
    });
  }
  var form = $("form#msgForm").on("submit", async function (e) {
    e.preventDefault();

    // get input from message box
    let msg_input = document.getElementById("msg");
    let user_input = msg_input.value;
    let user_name = await load_name();

    // clear msg box value
    msg_input.value = "";

    // send message to other users
    if (user_input != ''){
      socket.emit("event", {
        message: user_input,
        name: user_name,
      });
    };
  });
});

socket.on("disconnect", async function (msg) {
  var usr_name = await load_name();
  socket.emit("event", {
    message: usr_name + " just left the server...",
  });
});

socket.on("message response", function (msg) {
  add_messages(msg, true);
});

window.onload = async function () {
  var msgs = await load_messages();
  for (i = 0; i < msgs.length; i++) {
    scroll = false;
    if (i == msgs.length - 1) {
      scroll = true;
    }
    add_messages(msgs[i], scroll);
  }

  let name = await load_name();
  if (name != "") {
    $("#login").hide();
  } else {
    $("#logout").hide();
  }
  $('#smile').hide();
  $('#smiletoggle').val('lock');
};

