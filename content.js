
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

// Updated Codeforces problem parser
function getCodeforcesStatement() {
    try {
        // Get problem title
        const titleElement = document.querySelector('.problem-statement .title');
        const title = titleElement ? titleElement.textContent.trim() : '';

        // Get time and memory limits
        const timeLimitElement = document.querySelector('.time-limit');
        const memoryLimitElement = document.querySelector('.memory-limit');
        const inputFileElement = document.querySelector('.input-file');
        const outputFileElement = document.querySelector('.output-file');

        let limits = '';
        if (timeLimitElement) limits += timeLimitElement.textContent.trim() + '\n';
        if (memoryLimitElement) limits += memoryLimitElement.textContent.trim() + '\n';
        if (inputFileElement) limits += inputFileElement.textContent.trim() + '\n';
        if (outputFileElement) limits += outputFileElement.textContent.trim() + '\n';

        // Get problem statement text
        // Get all div elements that are direct children of .problem-statement
        const problemDivs = document.querySelectorAll('.problem-statement > div');
        let problemText = '';
        let foundStatement = false;

        // Skip the header div (index 0) and process until we hit input specification
        for (let i = 1; i < problemDivs.length; i++) {
            const div = problemDivs[i];
            if (div.classList.contains('input-specification')) break;
            
            // Skip if it's a section title
            if (!div.classList.contains('header') && !div.querySelector('.section-title')) {
                problemText += div.textContent.trim() + '\n\n';
                foundStatement = true;
            }
        }

        // Get input specification
        const inputSpec = document.querySelector('.input-specification');
        const inputSpecText = inputSpec ? 
            'Input\n' + inputSpec.textContent.replace('Input', '').trim() : '';

        // Get output specification
        const outputSpec = document.querySelector('.output-specification');
        const outputSpecText = outputSpec ? 
            '\nOutput\n' + outputSpec.textContent.replace('Output', '').trim() : '';

        // Get sample tests with proper formatting
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

        // Get note if exists
        const note = document.querySelector('.note');
        const noteText = note ? '\n\nNote:\n' + note.textContent.trim() : '';

        // Combine all parts
        return `${title}\n\n${limits}\nProblem Statement:\n${problemText}${inputSpecText}${outputSpecText}${samplesText}${noteText}`;
    } catch (error) {
        console.error('Error parsing Codeforces problem:', error);
        return null;
    }
}


// Updated AtCoder problem parser
function getAtCoderStatement() {
    try {
        // Get title from English section
        const titleElement = document.querySelector('.lang-en h3');
        const title = titleElement ? titleElement.textContent.trim() : '';

        // Get time and memory limits
        const timeLimit = document.querySelector('.time-limit');
        const memoryLimit = document.querySelector('.memory-limit');
        let limits = '';
        if (timeLimit && memoryLimit) {
            limits = `${timeLimit.textContent.trim()}\n${memoryLimit.textContent.trim()}`;
        }

        // Get problem statement from English section
        let problemText = '';
        const statementParts = document.querySelectorAll('.lang-en div[class^="part"]');
        
        for (const part of statementParts) {
            const header = part.querySelector('h3');
            const content = part.querySelector('section');
            
            if (header) {
                const headerText = header.textContent.trim();
                if (headerText.toLowerCase().includes('problem statement')) {
                    problemText = content ? content.textContent.trim() : '';
                }
            }
        }

        // Get constraints from English section
        let constraints = '';
        const constraintsPart = Array.from(statementParts).find(part => {
            const header = part.querySelector('h3');
            return header && header.textContent.trim().toLowerCase().includes('constraints');
        });
        if (constraintsPart) {
            const content = constraintsPart.querySelector('section');
            constraints = content ? content.textContent.trim() : '';
        }

        // Get input format from English section
        let inputFormat = '';
        const inputPart = Array.from(statementParts).find(part => {
            const header = part.querySelector('h3');
            return header && header.textContent.trim().toLowerCase().includes('input');
        });
        if (inputPart) {
            const content = inputPart.querySelector('section');
            inputFormat = content ? content.textContent.trim() : '';
        }

        // Get output format from English section
        let outputFormat = '';
        const outputPart = Array.from(statementParts).find(part => {
            const header = part.querySelector('h3');
            return header && header.textContent.trim().toLowerCase().includes('output');
        });
        if (outputPart) {
            const content = outputPart.querySelector('section');
            outputFormat = content ? content.textContent.trim() : '';
        }

        // Get sample cases - New improved version
        let samplesText = '\nSample Test Cases:';
        const sampleSections = document.querySelectorAll('.lang-en section');
        let currentSample = [];
        
        sampleSections.forEach(section => {
            // Look for h3 elements containing "Sample Input" or "Sample Output"
            const sampleHeaders = section.querySelectorAll('h3');
            let samplePres = section.querySelectorAll('pre');
            
            // If we found pre elements directly
            if (samplePres.length > 0) {
                samplePres.forEach(pre => {
                    let prevHeader = pre.previousElementSibling;
                    while (prevHeader && prevHeader.tagName !== 'H3') {
                        prevHeader = prevHeader.previousElementSibling;
                    }
                    
                    if (prevHeader) {
                        const headerText = prevHeader.textContent.trim().toLowerCase();
                        if (headerText.includes('sample input')) {
                            const sampleNumber = headerText.match(/\d+/) || ['1'];
                            samplesText += `\n\nSample Input ${sampleNumber[0]}:\n${formatPreContent(pre)}`;
                        } else if (headerText.includes('sample output')) {
                            const sampleNumber = headerText.match(/\d+/) || ['1'];
                            samplesText += `\n\nSample Output ${sampleNumber[0]}:\n${formatPreContent(pre)}`;
                        }
                    }
                });
            }
        });

        // Format the final output
        let output = title ? `${title}\n\n` : '';
        output += limits ? `${limits}\n\n` : '';
        output += problemText ? `Problem Statement:\n${problemText}\n\n` : '';
        output += constraints ? `Constraints:\n${constraints}\n\n` : '';
        output += inputFormat ? `Input:\n${inputFormat}\n\n` : '';
        output += outputFormat ? `Output:\n${outputFormat}\n\n` : '';
        output += samplesText;

        // Clean up any excessive newlines
        output = output.replace(/\n{3,}/g, '\n\n');
        
        return output;
    } catch (error) {
        console.error('Error parsing AtCoder problem:', error);
        return null;
    }
}

// Helper function to format pre content
function formatPreContent(preElement) {
    if (!preElement) return '';
    
    // Get the text content and split by newlines
    let text = preElement.innerText || preElement.textContent;
    
    // Split by newlines, trim each line, and filter out empty lines
    return text.split('\n')
               .map(line => line.trim())
               .filter(line => line.length > 0)
               .join('\n');
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