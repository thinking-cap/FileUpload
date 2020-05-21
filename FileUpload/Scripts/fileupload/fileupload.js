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

        reader.onloadend = function (event) {
            if (event.target.readyState !== FileReader.DONE) {
                return;
            }

            $.ajax({
                url: 'upload.ashx',
                type: 'POST',
                dataType: 'json',
                cache: false,
                data: {
                    action: action,
                    file_data: event.target.result,
                    file: file.name,
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
                        // More to upload, call function recursively
                        upload_file(next_slice);
                    } else {
                        // Update upload progress
                        $('.file-more').show();
                        $('.progress-bar.file-upload').css('width', '100%').text('100%');
                    }
                }
            });
        };

        reader.readAsDataURL(blob);
    }

})(jQuery);