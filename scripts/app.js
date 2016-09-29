'use strict';

var $id = function(id) {
  return document.getElementById(id);
};

var $class = function(klass) {
  return document.querySelector('.'+klass);
};

var $classes = function(klasses) {
  return document.querySelectorAll('.'+klasses);
};

var UI = {
  currentView: 'browse-colleagues',
  currentColleague: null,
  filteredBy: 0,
  templates: {
    colleagueCard: $id('colleague_card'),
    comet: $id('comet'),
    cometDetail: $id('cometDetail'),
    chooseColleague: $id('chooseColleague')
  },
  nav: {
    browseColleagues: function(){
      $class('back-arrow').classList.remove('show');
      return UI.transition(event, 'browse-colleagues', UI.renderColleagueCards, false);
    },
    colleagueDetail: function(){
      $class('back-arrow').classList.add('show');
      $class('back-arrow').onclick = UI.nav.browseColleagues;
      $class('colleague-detail').classList.add('show');
      return UI.transition(event, 'colleague-detail', UI.renderColleagueDetail, false);
    },
    closeColleageDetail: function() {
      $class('back-arrow').classList.remove('show');
      return UI.transition(event, 'browse-colleagues', false);
    },
    cometDetail: function(){
      return UI.transition(event, 'comet-detail', UI.renderCometDetail, true);
    },
    closeDetail: function() {
      $class('back-arrow').classList.add('show');
      $class('transition-sheet').remove();
      $class('back-arrow').onclick = UI.nav.browseColleagues;
      return UI.transition(event, 'colleague-detail', false);
    },
  },
  bindToMany: function(elements, eventType, fn) {
    var els = $classes(elements);
    for(var i = 0; i < els.length; i++) {
      els[i][eventType] = fn;
    }
  },
  newComet: {
    currentQuestion: 0,
    values: {},
    showNewComet: function() {
      $class('back-arrow').classList.remove('show');
      $class('new-comet').classList.add('show');
    },
    hideNewComet: function() {
      this.currentQuestion = 0;
      for(var prop in this.values) {
        var el = document.querySelector('#'+prop);
        if(el !== null) {
          el.value = '';
        }
      }
      var colleageChoices = document.querySelectorAll('input[name=colleaguechoices]');
      var whenChoices = document.querySelectorAll('input[name=whenchoices]');
      var buttons = $classes('button-container .btn');
      for (var i = 0; i < colleageChoices.length; i++) {
          if (colleageChoices[i].checked) {
            colleageChoices[i].checked = false;
          }
          buttons[i].disabled = true;
      }
      for (var j = 0; j < whenChoices.length; j++) {
          if (whenChoices[j].checked) {
            whenChoices[j].checked = false;
          }
      }
      $id('when').value = new Date().toDateInputValue();
      this.values = {};
      this.navQuestion(0);
      if(UI.currentView === 'colleague-detail') {
          $class('back-arrow').classList.add('show');
      }
      $class('new-comet').classList.remove('show');
    },
    activateBtn: function() {
      var inputs = $classes('input-content');
      var currentQuestion = UI.newComet.currentQuestion;
      var btn = inputs[currentQuestion].querySelector('.button-container .btn');
      var textarea = inputs[currentQuestion].querySelector('textarea');
      var radios = document.querySelectorAll('input[name=colleaguechoices]');
      for (var i = 0; i < radios.length; i++) {
          if (radios[i].checked) {
            UI.newComet.values.who = radios[i].value;
            btn.classList.add('btn--main');
            btn.innerHTML = 'Next';
            btn.disabled = false;
          }
      }
      if(textarea.value.length > 0) {
        UI.newComet.values[textarea.getAttribute('id')] = textarea.value;
        console.log(textarea.getAttribute('id'));
        btn.classList.add('btn--main');
        btn.innerHTML = 'Next';
        btn.disabled = false;
      }
      else {
        btn.classList.remove('btn--main');
        btn.innerHTML = 'Skip';
        btn.disabled = false;
      }
    },
    navQuestion: function(dir) {
      this.currentQuestion = this.currentQuestion + dir;
      $class('input-container').style.webkitTransform = 'translate3d('+this.currentQuestion*-375+'px, 0, 0)';
      if(this.currentQuestion > 0) {
        $class('header--new-comet .back-arrow').classList.add('show');
      }
      else {
        $class('header--new-comet .back-arrow').classList.remove('show');
      }
      if(this.currentQuestion === 4) {
        UI.newComet.values.when = $id('reviewWhen').value;
      }
      if(this.currentQuestion === 5) {
        var what = $id('reviewWhat'),
            who = $id('reviewWho'),
            why = $id('reviewWhy'),
            success = $id('reviewSuccess'),
            when = $id('reviewWhen');
        who.value = this.backupEmptyState(UI.newComet.values['who']);
        what.value = $id('what').value;
        why.value = $id('why').value;
        success.value = $id('success').value;
        when.value = $id('when').value;
        // when.value = this.backupEmptyState(UI.newComet.values['when']);
      }
    },
    backupEmptyState: function(value) {
      if(value) {
        return value;
      }
      else {
        return '(none)';
      }
    },
    create: function() {
      var comet = {};
      var committer;
      if(UI.currentColleague) {
        committer = UI.currentColleague.id;
      }
      else {
        committer = 0;
      }
      var committee = UI.newComet.values['who'];
      committee = map(Data.colleagues, 'name', committee);
      console.log(committee);
      comet.who = committee[0].id;
      comet.what = $id('what').value;
      comet.why = $id('why').value;
      comet.when = $id('when').value;
      comet.succes = $id('success').value;
      Data.colleagues[committer].commitments.push(comet);
      this.hideNewComet();
      UI.nav.browseColleagues();
    }
  },
  filterCommitter: function() {
    var radios = document.querySelectorAll('input[name=comettoggle]');
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            if(radios[i].value === 'fromme') {
              UI.filteredBy = 0;
            }
            else {
              UI.filteredBy = UI.currentColleague[0].id;
            }
        }
    }
    UI.renderColleagueDetail();
  },
  genSheet: function(e) {
    var transformStart = e.target.getBoundingClientRect();
    var sheet = document.createElement('div');
    var container = $class('mobile-container');
    sheet.classList.add('transition-sheet');
    sheet.style.top = transformStart.top - container.offsetTop+'px';
    sheet.style.left = transformStart.left - container.offsetLeft+'px';
    sheet.style.width = transformStart.width+'px';
    sheet.style.height = transformStart.height+'px';
    return sheet;
  },
  transition: function(e, nextView, renderFn, transition) {
    if(transition) {
      var sheet = UI.genSheet(e);
      var photo = UI.currentColleague[0].picture;
      sheet.style.background = 'url(../assets/images/'+photo+'.png)';
      sheet.style.backgroundSize = '100%';
      $class('mobile-container').appendChild(sheet);
      $class(nextView).style.display = 'block';
      setTimeout(function() {
        $class(UI.currentView).style.display = 'none';
        UI.currentView = nextView;
      }, 500);
      if(renderFn) {
        renderFn(e);
      }
    }
    else {
      if(renderFn) {
        renderFn(e);
      }
      $class(UI.currentView).style.display = 'none';
      UI.currentView = nextView;
      $class(nextView).style.display = 'block';
    }
  },
  renderColleagueCards: function() {
    $class('colleague-container').innerHTML = '';
    for(var i = 1; i < Data.colleagues.length; i++) {
      var el = UI.templates.colleagueCard.content.cloneNode(true);
      var colleague = el.querySelector('.colleague');
      colleague.style.background = 'url("assets/images/'+Data.colleagues[i].picture+'.png")';
      colleague.style.backgroundSize = 'cover';
      colleague.setAttribute('data-colleague-id', i);
      colleague.onclick = UI.nav.colleagueDetail;
      el.querySelector('.colleague-name').innerHTML = Data.colleagues[i].name;
      $class('colleague-container').appendChild(el);
    }
  },
  renderColleagueChoices: function() {
    for(var i = 0; i < Data.colleagues.length; i++) {
      var el = UI.templates.chooseColleague.content.cloneNode(true);
      var colleague = el.querySelector('.colleague-choice');
      colleague.onclick = UI.newComet.activateBtn;
      colleague.querySelector('img').setAttribute('src', 'assets/images/'+Data.colleagues[i].picture+'.png');
      colleague.querySelector('input').setAttribute('id', 'colleagueChoice'+Data.colleagues[i].id);
      colleague.querySelector('input').value = Data.colleagues[i].name;
      colleague.querySelector('label').setAttribute('for', 'colleagueChoice'+Data.colleagues[i].id);
      el.querySelector('.colleague-choice-name').innerHTML += Data.colleagues[i].name;
      $class('choose-colleague').appendChild(el);

      //populate dropdown in review screen
      var option = createTextEl('option', Data.colleagues[i].name);
      option.value = Data.colleagues[i].name;
      $id('reviewWho').appendChild(option);
    }
  },
  getCommitments() {
    var committer,
        comets;
    if(UI.filteredBy === 0) {
      committer = map(Data.colleagues, 'id', 0);
      comets = map(committer[0].commitments, 'who', UI.currentColleague[0].id);
    }
    else {
      committer = map(Data.colleagues, 'id', UI.currentColleague[0].id);
      comets = map(committer[0].commitments, 'who', 0);
    }
    return comets;
  },
  renderColleagueDetail: function(e) {
    $class('comet-slider').innerHTML = '';
    var id;
    var colleague;
    if(e) {
      id = e.target.getAttribute('data-colleague-id');
      colleague = map(Data.colleagues, 'id', id);
      UI.filteredBy = colleague[0].id;
      UI.currentColleague = colleague;
    }
    else {
      colleague = UI.currentColleague;
    }
    var comets = UI.getCommitments();
    $class('comet-slider').style.width = comets.length*315+'px';
    for(var i = 0; i < comets.length; i++) {
      var el = UI.templates.comet.content.cloneNode(true);
      var comet = el.querySelector('.comet');
      comet.setAttribute('data-comet-id', i);
      comet.style.background = 'url("assets/images/'+colleague[0].picture+'.png")';
      comet.style.backgroundSize = 'cover';
      if(UI.filteredBy === 0) {
        comet.querySelector('.comet-flag').innerHTML = 'You commited to '+colleague[0].name+':';
      }
      else {
        comet.querySelector('.comet-flag').innerHTML = colleague[0].name+' commited to you:';
      }
      comet.querySelector('.comet-title').innerHTML = comets[i].what;
      comet.querySelector('.comet-duedate').innerHTML += comets[i].when;
      comet.onclick = UI.nav.cometDetail;
      $class('comet-slider').appendChild(comet);
    }
  },
  renderCometDetail: function(e) {
    var id = e.target.getAttribute('data-comet-id');
    var comet = UI.currentColleague[0].commitments[id];
    var el = UI.templates.cometDetail.content.cloneNode(true);
    $class('comet-detail').innerHTML = '';
    el.querySelector('.comet-photo').style.backgroundSize = 'cover';
    el.querySelector('.comet-flag').innerHTML = UI.currentColleague[0].name + ' commited to you:';
    el.querySelector('.comet-detail-title').innerHTML = comet.what;
    el.querySelector('.reason').innerHTML = comet.why;
    el.querySelector('.success').innerHTML = comet.success;
    el.querySelector('.deadline').innerHTML = comet.when;
    $class('comet-detail').appendChild(el);
  }
};

//UTILS

var createTextEl = function(wrap, str) {
  var el = document.createElement(wrap);
  el.appendChild(document.createTextNode(str));
  return el;
};

var map = function(arr, key, val) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if(key === 'id') {
      if (arr[i][key] === parseInt(val)) {
        result.push(arr[i]);
      }
    }
    else {
      if (arr[i][key] === val) {
        result.push(arr[i]);
      }
    }

  }
  return result;
};

var preloadImages = function(array) {
    if (!preloadImages.list) {
        preloadImages.list = [];
    }
    var list = preloadImages.list;
    for (var i = 0; i < array.length; i++) {
        var img = new Image();
        img.onload = function() {
            var index = list.indexOf(this);
            if (index !== -1) {
                // remove image from the array once it's loaded
                // for memory consumption reasons
                list.splice(index, 1);
            }
        };
        list.push(img);
        img.src = 'assets/images/'+array[i]+'.png';
        img.style.webkitTransform = 'translate3d(0,0,1px)';
    }
};

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});


document.addEventListener('DOMContentLoaded', function() {
  UI.renderColleagueCards();
  UI.renderColleagueChoices();
  preloadImages(['alex', 'man1', 'maria', 'mark', 'ricardo']);
  document.getElementById('when').value = new Date().toDateInputValue();
});
