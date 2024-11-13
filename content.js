
function formatPreContent(preElement) {
    if (!preElement) return '';
    let text = preElement.innerText || preElement.textContent;
    return text.split('\n')
               .map(line => line.trim())
               .filter(line => line.length > 0)
               .join('\n');
}


function getTextContent(element, defaultValue = '') {
    return element ? element.textContent.trim() : defaultValue;
}


function detectPlatform(url) {
    if (url.includes('codeforces.com')) return 'codeforces';
    if (url.includes('atcoder.jp')) return 'atcoder';
    if (url.includes('codechef.com')) return 'codechef';
    return null;
}

function getCodeforcesStatement() {
    try {
        
        const titleElement = document.querySelector('.problem-statement .title');
        const title = titleElement ? titleElement.textContent.trim() : '';

        const limits = document.querySelector('.problem-statement .time-limit');
        const timeMemoryLimits = limits ? limits.parentElement.textContent.trim() : '';


        const problemStatementDiv = document.querySelector('.problem-statement');
        const problemTextDiv = problemStatementDiv.querySelector('div:nth-child(2)');
        const problemText = problemTextDiv ? problemTextDiv.textContent.trim() : '';

    
        const inputSpec = document.querySelector('.input-specification');
        const inputSpecText = inputSpec ? inputSpec.textContent.trim() : '';

        
        const outputSpec = document.querySelector('.output-specification');
        const outputSpecText = outputSpec ? outputSpec.textContent.trim() : '';

        
        let samplesText = '\nSample Test Cases:';
        const samples = document.querySelectorAll('.sample-test');
        samples.forEach((sample, index) => {
            const input = sample.querySelector('.input pre');
            const output = sample.querySelector('.output pre');
            
            if (input && output) {
                const formattedInput = formatPreContent(input);
                const formattedOutput = formatPreContent(output);
                
                samplesText += `\n\nInput ${index + 1}:\n${formattedInput}`;
                samplesText += `\n\nOutput ${index + 1}:\n${formattedOutput}`;
            }
        });

        
        const note = document.querySelector('.note');
        const noteText = note ? '\n\nNote:\n' + note.textContent.trim() : '';

   
        return `${title}\n\n${timeMemoryLimits}\n\nProblem Statement:\n${problemText}\n\nInput Specification:\n${inputSpecText}\n\nOutput Specification:\n${outputSpecText}${samplesText}${noteText}`;
    } catch (error) {
        console.error('Error parsing Codeforces problem:', error);
        return null;
    }
}


function getAtCoderStatement() {
    const title = getTextContent(document.querySelector('.h2'));
    const problemText = getTextContent(document.querySelector('#task-statement span[class^="lang"] .part:nth-child(2)'));
    
    let limits = '';
    const timeLimit = document.querySelector('.time-limit');
    const memoryLimit = document.querySelector('.memory-limit');
    if (timeLimit && memoryLimit) {
        limits = `Time limit: ${timeLimit.textContent}\nMemory limit: ${memoryLimit.textContent}`;
    }


    const constraints = getTextContent(document.querySelector('#task-statement span[class^="lang"] .part:nth-child(3)'));
    
    let samplesText = '\nSample Test Cases:';
    const samples = document.querySelectorAll('#task-statement .part pre');
    for (let i = 0; i < samples.length; i += 2) {
        const input = samples[i];
        const output = samples[i + 1];
        if (input && output) {
            const sampleNum = Math.floor(i / 2) + 1;
            samplesText += `\n\nInput ${sampleNum}:\n${formatPreContent(input)}`;
            samplesText += `\n\nOutput ${sampleNum}:\n${formatPreContent(output)}`;
        }
    }

    return `${title}\n\n${limits}\n\nProblem Statement:\n${problemText}\n\nConstraints:\n${constraints}${samplesText}`;
}

function getCodeChefStatement() {
    try {
        
        const title = document.querySelector('#problem-statement h3')?.textContent.trim() || '';

        
        const allElements = document.querySelectorAll('#problem-statement > *');
        let problemText = '';
        let isProblemStatement = false;
        let isInputFormat = false;
        
        for (const element of allElements) {
            if (element.tagName === 'H3') {
                if (element.textContent.includes('Input Format')) {
                    isInputFormat = true;
                    break;
                }
                if (element.textContent === title) {
                    isProblemStatement = true;
                    continue;
                }
            }
            if (isProblemStatement && !isInputFormat) {
                problemText += element.textContent.trim() + '\n';
            }
        }

        
        const inputFormatTitle = document.evaluate(
            "//h3[contains(text(),'Input Format')]",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
        
        let inputFormat = '';
        let currentNode = inputFormatTitle?.nextElementSibling;
        while (currentNode && currentNode.tagName !== 'H3') {
            inputFormat += currentNode.textContent.trim() + '\n';
            currentNode = currentNode.nextElementSibling;
        }

       
        const outputFormatTitle = document.evaluate(
            "//h3[contains(text(),'Output Format')]",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
        
        let outputFormat = '';
        currentNode = outputFormatTitle?.nextElementSibling;
        while (currentNode && currentNode.tagName !== 'H3') {
            outputFormat += currentNode.textContent.trim() + '\n';
            currentNode = currentNode.nextElementSibling;
        }

      
        let samplesText = '\nSample Test Cases:';
        const sampleTitle = document.evaluate(
            "//h3[contains(text(),'Sample')]",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (sampleTitle) {
            const samplesTable = sampleTitle.nextElementSibling;
            if (samplesTable) {
                const inputs = samplesTable.querySelectorAll('pre:nth-child(odd)');
                const outputs = samplesTable.querySelectorAll('pre:nth-child(even)');
                
                for (let i = 0; i < inputs.length; i++) {
                    samplesText += `\n\nInput ${i + 1}:\n${formatPreContent(inputs[i])}`;
                    if (outputs[i]) {
                        samplesText += `\n\nOutput ${i + 1}:\n${formatPreContent(outputs[i])}`;
                    }
                }
            }
        }

        
        return `${title}\n\nProblem Statement:\n${problemText}\nInput Format:\n${inputFormat}\nOutput Format:\n${outputFormat}${samplesText}`;
    } catch (error) {
        console.error('Error parsing CodeChef problem:', error);
        return null;
    }
}


async function getProblemStatement() {
    try {
        const platform = detectPlatform(window.location.href);
        let problemText = '';

        switch (platform) {
            case 'codeforces':
                problemText = getCodeforcesStatement();
                break;
            case 'atcoder':
                problemText = getAtCoderStatement();
                break;
            case 'codechef':
                problemText = getCodeChefStatement();
                break;
            default:
                throw new Error('Unsupported platform');
        }

        return problemText;
    } catch (error) {
        console.error('Error getting problem statement:', error);
        return null;
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "getProblem") {
            getProblemStatement().then(problemText => {
                sendResponse({problemText: problemText});
            });
            return true;
        }
    }
);