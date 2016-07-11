$('.logs').each(function () {
  var updating = false, newest_time = ''
  var ids = [], oldest_time = ''

  function element_in_scroll(elem)
  {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height() + 800;

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
  }

  $(document).scroll(function(e){
    if (element_in_scroll(".logs-end")) {
      backfill()
    }
  })

  function backfill () {
    if (updating) return
    updating = true
    $.getJSON('/logs?oldest_time=' + oldest_time, function (data) {
      updating = false
      if (!data.logs || !data.logs.length) {
        return
      }
      var delay = 0
      data.logs.forEach(function (log) {
        if (ids.indexOf(log.id) !== -1) return
        if (!newest_time) newest_time = log.time
        var $el = $('<div class="log-line" style="display:none">' + log.html + '</div>')
        $('.logs').append($el)
        setTimeout(function () {
          $el.fadeIn('slow')
        }, delay)
        delay += 10
        ids.push(log.id)
        oldest_time = log.time
      })
    })
  }

  function poll () {
    if (updating) return
    updating = true
    $.getJSON('/logs?newest_time=' + newest_time, function (data) {
      updating = false
      var delay = 0
      data.logs.reverse().forEach(function (log) {
        if (ids.indexOf(log.id) !== -1) return
        var $el = $('<div class="log-line" style="display:none">' + log.html + '</div>')
        $('.logs').prepend($el)
        setTimeout(function () {
          $el.fadeIn('slow')
        }, delay)
        delay += 10
        ids.push(log.id)
        if (log.data && log.data.zmi) {
          document.title = document.title.replace(/.+ \- /, '')
          if (log.data.rs && log.data.rs.new_max_vol) {
            $el.addClass('new_max_vol')
            log.data.zmi = log.data.zmi.replace('/', '*/')
            var orig_zmi = log.data.zmi
            var blink_on = false
            var blinks = 6, orig_title = document.title
            ;(function blink () {
              setTimeout(function () {
                if (blink_on) {
                  document.title = ''
                }
                else {
                  document.title = orig_zmi + ' - ' + orig_title
                }
                blink_on = !blink_on
                if (blinks--) blink()
              }, 400)
            })()
          }
          document.title = log.data.zmi + ' - ' + document.title
        }
        newest_time = log.time
      })
    })
  }

  setInterval(poll, 10000)
  backfill()
})