var LinksPage = LinksPage || {};

LinksPage.Data = 
{
	EnableVibro: false,
	SelectedLinkIndex: 0
};

LinksPage.OnloadPage = function()
{
	setTimeout(LinksPage.ChangeLinkDecorate, 100);
	LinksPage.WarningModal.init();
}

LinksPage.ChangeLinkDecorate = function()
{
	let links = document.body.querySelector(".intro__nav").querySelectorAll("a");
	
	LinksPage.Data.SelectedLinkIndex +=1;
	
	if(links.length <= LinksPage.Data.SelectedLinkIndex )
	{
		LinksPage.Data.SelectedLinkIndex = 0;
	}
	
	
	links.forEach((el, index) => {
		if(index == LinksPage.Data.SelectedLinkIndex)
		{
			el.classList.add("glow-link")
		}
		else
		{ 
			el.classList.remove("glow-link");
		}
});

setTimeout(LinksPage.VibroEffect, 1);
setTimeout(LinksPage.ChangeLinkDecorate, 4000);

}

LinksPage.VibroEffect = function()
{
	if(LinksPage.Data.EnableVibro)
	{
		window.navigator.vibrate([100,30,100,30,100,200,200,30,200,30,200,200,100,30,100,30,100]);				
	}
	
}


LinksPage.WarningModal = (function() {
    var overlay, modal, msgEl, closeBtn;

    function getUrlParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    function setMessageText(el, text) {
        el.textContent = text;
    }

    function showWarning(text) {
        setMessageText(msgEl, text);
        overlay.classList.add('show');
        overlay.setAttribute('aria-hidden', 'false');
        closeBtn.focus();
    }

    function hideWarning() {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
    }

    function init() {
        overlay = document.getElementById('warnOverlay');
        modal = document.getElementById('warnModal');
        msgEl = document.getElementById('warnMessage');
        closeBtn = document.getElementById('closeBtn');

        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            hideWarning();
        });

        modal.addEventListener('click', function() {
            hideWarning();
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') hideWarning();
        });

        var raw = getUrlParam('WarnMsg');
        if (raw !== null) {
            var trimmed = raw.trim();
            if (trimmed.length > 0) {
                showWarning(trimmed);
            }
        }
    }

    return {
        init: init
    };
})();