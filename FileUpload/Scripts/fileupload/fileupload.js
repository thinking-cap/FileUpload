(function ($) {

    var reader = {};
    var file = {};
    var slice_size = 1000 * 1024;

    function start_upload(event) {
        event.preventDefault();
        $('.progress').css('visibility', 'visible');
        reader = new FileReader();
        file = document.querySelector('#file-upload').files[0];
        $('#file-upload').hide();
        $('#file-upload-submit').hide();
        startTimer();
        upload_file(0);
        return false;
    }

    $('.file-more').on('click', function () {
        $(this).hide();
        $('#file-upload').show();
        $('#file-upload-submit').show();
        $('.progress').css('visibility', 'hidden');
        $('.progress-bar.file-upload').css('width', '0%').text('0%');
        
    });
    $('#file-upload-submit').on('click', start_upload);

    function upload_file(start) {
        var action = (start === 0) ? 'create' : 'append';
        var next_slice = start + slice_size + 1;
        var blob = file.slice(start, next_slice);
        var filename = file.name;
        
        reader.onloadend = function (event) {
            if (event.target.readyState !== FileReader.DONE) {
                return;
            }

            $.ajax({
                url: 'upload.ashx',
                type: 'POST',
                dataType: 'json',
                cache: false,
                file: filename,
                fileType : file.type,
                data: {
                    action: action,
                    file_data: event.target.result,
                    file: filename,
                    file_type: file.type
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR, textStatus, errorThrown);
                },
                success: function (data) {
                    var size_done = start + slice_size;
                    var percent_done = Math.floor((size_done / file.size) * 100);

                    if (next_slice < file.size) {
                        // Update upload progress
                        $('.progress-bar.file-upload').css('width', percent_done + '%').text(percent_done + '%');
                        $('.progress-mb').text(`${Math.floor(size_done / 1048576)}mb of ${Math.floor(file.size / 1048576)}mb`);
                        // More to upload, call function recursively
                        upload_file(next_slice);
                    } else {
                        // Update upload progress
                        $('.file-more').show();
                        $('.progress-bar.file-upload').css('width', '100%').text('100%');
                        $('.progress-mb').text(`Complete! Uploaded ${Math.floor(size_done / 1048576)}mb`);
                        buildLink(this.file,this.fileType);
                        clearTimer();
                    }
                    
                }
            });
        };

        reader.readAsDataURL(blob);
    }

})(jQuery);

function deleteFile(el) {
    let f = $(el).data().file;
    $.ajax({
        url: 'upload.ashx',
        data: {
            action: 'delete',
            file : f
        },
        element : el,
        success: function () {
            $(el).parent().remove();
        }
    });
}
var timer = null;
var totalSeconds = 0;
function startTimer() {
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    totalSeconds++;
    let seconds = pad(totalSeconds % 60);
    let minutes = pad(parseInt(totalSeconds / 60));
    $('.timer .time').text(minutes + ':' + seconds);
}

function clearTimer() {
    clearInterval(timer);
    totalSeconds = 0;
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}

function buildLink(file, type) {
    var link = $(`<div><a href="Files\\${file}" target="_blank">${file}</a><span data-file="${file}" onclick="deleteFile(this);">Delete</span></div>`);
    $('.success').append(link);
}