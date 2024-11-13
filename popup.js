document.addEventListener('DOMContentLoaded', function() {
    const copyButton = document.getElementById('copyButton');
    const status = document.getElementById('status');

    function isValidProblemPage(url) {
        return (
            (url.includes('codeforces.com') && 
             (url.includes('/problemset/problem/') || url.includes('/contest/') || url.includes('/problem/'))) ||
            (url.includes('atcoder.jp') && url.includes('/tasks/')) ||
            (url.includes('codechef.com') && url.includes('/problems/'))
        );
    }

    function getPlatformName(url) {
        if (url.includes('codeforces.com')) return 'Codeforces';
        if (url.includes('atcoder.jp')) return 'AtCoder';
        if (url.includes('codechef.com')) return 'CodeChef';
        return 'Unknown Platform';
    }

    async function executeCopy(tabId) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, {action: "getProblem"});
            if (response && response.problemText) {
                await navigator.clipboard.writeText(response.problemText);
                copyButton.textContent = 'Copied!';
                status.textContent = 'Problem copied to clipboard';
                setTimeout(() => {
                    copyButton.textContent = 'Copy Problem';
                    status.textContent = '';
                }, 2000);
            } else {
                throw new Error('Failed to get problem text');
            }
        } catch (error) {
            console.error('Error:', error);
            status.textContent = 'Failed to copy. Please try again.';
            setTimeout(() => {
                status.textContent = '';
            }, 2000);
        }
    }

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = tabs[0].url;
        if (!isValidProblemPage(url)) {
            copyButton.disabled = true;
            status.textContent = 'Please open a supported problem page';
            return;
        }

        copyButton.addEventListener('click', function() {
            executeCopy(tabs[0].id);
        });
    });
});

// test 