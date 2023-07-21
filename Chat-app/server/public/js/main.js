var sender_id = `<%= user._id %>`
    var receiver_id;


    // first parameter name-space se connection ka kaam kr rha hai or dusra parameter as a auth kaam rha hai identification ke liye.
    const socket = io('/user-namespace', {
        // ! aise hnm auth ke sath id bhejenge.
        auth:{
            token: `<%= user._id %>`
        }
    });


    // this is for show chtion box
    $(document).ready(function(){
        $('.user-profile').click(function(){

            // * ye uski id hai jise message bhej jayega
           let userId =  $(this).attr('data-id');
           receiver_id = userId;
           
            $('.start-head').hide();
            $('.chat-interface').show();

            // create custom event for show exists chat of a perticular person.
            socket.emit('existsChat', { sender_id:sender_id, receiver_id:receiver_id });

        })
    });


    //update your user status online
    socket.on('getOnlineUser', function(data){
        $('#' +data.user_id+'-status').text('Online')
        $('#' +data.user_id+'-status').removeClass('user-status0')
        $('#' +data.user_id+'-status').addClass('user-status1')
    })

    //update your user status offline
    socket.on('getOfflineUser', function(data){
        $('#' +data.user_id+'-status').text('Offline')
        $('#' +data.user_id+'-status').removeClass('user-status1')
        $('#' +data.user_id+'-status').addClass('user-status0')
    });


    // chat save of user
    $('#chat-form').submit(function(event){

        // ye page ko refresh hone se rokega
        event.preventDefault();

        let message = $('#message').val();

        $.ajax({
            url:'/save-chat',
            type: 'POST',
            data:{ 
                  sender_id:sender_id,
                  receiver_id:receiver_id,
                  message:message
                },
            success:function(response){
                if (response.success) {
                    console.log(response);
                    $('#message').val('');
                    let chat = response.data.message;
                    let html = `
                                <div class="current-user-chat">
                                    <h5>`+chat+`</h5>
                                </div>
                                `; 

                                $('#chat-container').append(html)
                                // reciever side msg save operatio
                                socket.emit('newChat', response.data);

                                // yha pr bhi hnme direct last chat pr bhejne wala function call kiya hai taki chat jese hi bheje wo hi subse pehle dikhe
                                scrollChat();
                }else {
                    alert(data.msg)
                }
            }
        })

    });

    // reciever side message shower
    socket.on('loadNewChat', function(data){

        // ye isliye taki shi insan pr shi msg jaye 
        if (sender_id === data.receiver_id && receiver_id === data.sender_id) {
            let html = `
                        <div class="distance-user-chat">
                            <h5>`+data.message+`</h5>
                        </div>
                        `;
            $('#chat-container').append(html);
        }    
    })


    // ya pr hnm sare chats ko show krenge from the database also.
    socket.on('loadAllChats', function(data){
        $('#chat-container').html('');

        var chats = data.chats;

        let html = ``;

        // check the length of the message 
        for(let x = 0; x < chats.length; x++){
            let addClass = '';

            if (chats[x]['sender_id'] == sender_id) {
                addClass = 'current-user-chat';
            }
            else {
                addClass = 'distance-user-chat';
            }

            html +=`
                    <div class='`+addClass+`'>
                        <h5>`+chats[x]['message']+`</h5>
                    </div>
                    `;
        }
        $('#chat-container').append(html);

        // yha hnme function call kiya hai
        scrollChat();
    })

    // ye isliye hai taki jub hnm kisi ke account ko khole to hnme direct last message pr lekr jaye
    function scrollChat(){
        $('#chat-container').animate({
            scrollTop: $('#chat-container').offset().top+$('#chat-container')[0].scrollHeight
        },0);
    }