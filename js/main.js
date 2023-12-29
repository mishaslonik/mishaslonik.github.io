var LinksPage = LinksPage || {};

LinksPage.Data = 
{
	EnableVibro: false,
	SelectedLinkIndex: 0
};

LinksPage.OnloadPage = function()
{
	setTimeout(LinksPage.ChangeLinkDecorate, 100);
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