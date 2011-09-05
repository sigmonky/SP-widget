var app;

window.chat = new Jabber.Xmpp();

$(document).ready(function(){

  	app = new App();
 	app.init();
	Backbone.history.start();

	$(function(){
		//To get the random tabs label with variable length for testing the calculations			
		//example 
		 $('#chat-area')
			.tabs()
			.scrollabletabs({
				customNavNext:'#n',
				customNavPrev:'#p',
				customNavFirst:'#f',
				customNavLast:'#l'//,
				//easing : 'easeInBounce'
			});

	});

	
});

function log(msg)
{
	$('#log').append('<div></div>').append(
	document.createTextNode(msg));
}

function onConnect(){
	log('on connect');
}

function FacebookNewInvite(){
        var receiverUserIds = FB.ui({ 
             method : 'apprequests',
             message: 'Come on man checkout SouthPark',
        },

       function(receiverUserIds) {
                   console.log("IDS : " + receiverUserIds.request_ids);
        }
      );
}

function onConnect(status)
{
	if (status == Strophe.Status.DISCONNECTED)
	log('Disconnected.');
}

function onResult(iq) {
	var elapsed = (new Date()) - startTime;
	log('Response from jabber.org took ' + elapsed + 'ms.');
}

/*
 * produces textual output ex '5 hours ago' from string formatted:
 * alert( dateStringPastTense('2007-08-20 10:34:01 pm') );
 * alert( dateStringPastTense('2009-02-20 14:34:23'   ) );
 * alert( dateStringPastTense('08/20/2008 11:29:43 pm') );
 * alert( dateStringPastTense('08/20/2008 23:29:55'   ) );
 */
function dateStringPastTense(date_input)
{
        var dtpieces = date_input.split(" ");
        var dpieces_his = dtpieces[1].split(":");
        var dpieces_ymd = dtpieces[0].split("-");
        if (dpieces_ymd == dtpieces[0])
        {
                var dpieces_mdy = dtpieces[0].split("/");
                dpieces_ymd[0] = dpieces_mdy[2];
                dpieces_ymd[1] = dpieces_mdy[0];
                dpieces_ymd[2] = dpieces_mdy[1];
        }
        if (dtpieces[2] && dtpieces[2].toLowerCase()=='pm')
        {
                dpieces_his[0]=dpieces_his[0]*1 + 12;
        }
        dpieces_ymd[1]-=1;
        
        var d = new Date();
        d.setFullYear( dpieces_ymd[0], dpieces_ymd[1], dpieces_ymd[2] );
        d.setHours   ( dpieces_his[0], dpieces_his[1], dpieces_his[2] );
        
        var sec = (new Date()).getTime() - d.getTime();
        sec/=1000;

        if (sec <0) 
        {
            return "in future";
        }
        var string_def = {'second':60,'minute':60,'hour':24,'day':30,'month':12,'year':1000};
        for(def in string_def)
        {
                if (sec < string_def[def])
                { 
                        return sec + " " + def + (sec>1? "s" : "")+ " ago";
                }
                sec= Math.floor( sec/string_def[def] );
        }
        return "over 1000 years ago";
}


function emoticons(text){
    // The base URL of all our smilies
    var url = "images/emoticons/";

    // A regex alternation that looks for all of them (be careful to use escapes
    // where necessary)
    var searchFor = /:D|:-D|:\)|:-\)|;\)|';-\)|:\(|:-\(|:o|:\?|8-\)|:x|:P|:\*/gi;

    // A map mapping each smiley to its image
    var map = {
        ":)"  : 'smile.png',
        ":P"  : 'tongue.png',
		":(" : 'frown.png',
		";)" : 'wink.png',
		":o" : 'yawn.png',
		":*" : 'kiss.png',
		
    };

    // Do the replacements
    text = text.replace(searchFor, function(match) {
        var rep;

        // Look up this match to see if we have an image for it
        rep = map[match];

        // If we do, return an `img` tag using that smiley icon; if not, there's
        // a mis-match between our `searchFor` regex and our map of
        // smilies, but handle it gracefully by returning the match unchanged.
        return rep ? '<img src="' + url + rep + '" class="emoticons" />' : match;
    });

    return (text);
}

function setCookie(c_name, value, exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name)
		{
			return unescape(y);
		}
	}
}
// 
// function log() {
//   if (typeof console == 'undefined') {  
//     return;  
//   }  
//   console.log.apply(console, arguments);
// }