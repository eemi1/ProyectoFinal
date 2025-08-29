window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("defaultTab").click();
});

function options(event, tabOption){
    event.preventDefault();

    document.querySelectorAll('.optContent').forEach(tab => {
        tab.style.display = 'none';
    });

    const selectedTab = document.getElementById(tabOption);
    if(selectedTab){
        selectedTab.style.display = 'flex';
    }

    document.querySelectorAll('.sidebar-options').forEach(link => {
        link.classList.remove('active');
    });

    event.currentTarget.classList.add('active');
}