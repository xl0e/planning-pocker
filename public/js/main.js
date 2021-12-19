$(".ajax-form").submit(function(e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.
  var form = $(this);
  var url = form.attr('action');
  var xhr = $.post({
    url: url,
    data: form.serialize(),
    success: function (data)
    {
      form.html(data);
    }
  });
});

$('#confirmDelete').on('show.bs.modal', function (e) {
  $(this).find('.delete').attr('href', $(e.relatedTarget).data('href'));
  $(this).find('.message').text($(e.relatedTarget).data('msg'));
});

$(document).ajaxSuccess(function(event, request) {
  if (request.getResponseHeader('Location')) {
     window.location = request.getResponseHeader('Location');
  }
});

$('.copy-location').click(function () {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(window.location.href).select();
  document.execCommand("copy");
  $temp.remove();
  var $this = $(this);
  $this.tooltip('show');
  setTimeout(function () {
    $this.tooltip('hide');
  }, 700);
});
