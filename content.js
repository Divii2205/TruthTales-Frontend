console.log('Content script loaded');
let reviewCounts = {
  REAL: 0,
  FAKE: 0,
  SUSPICIOUS: 0
};
// Function to generate a random classification (for demonstration purposes)
function analyzeReview(review) {
  console.log(review.length);
  
  if (review.length < 20) return 'SUSPICIOUS';
  if (review.length < 50) return 'FAKE';
  return 'REAL';
}

// Function to get color based on classification
function getColorForClassification(classification) {
  switch (classification) {
    case 'FAKE':
      return 'rgba(255, 0, 0, 0.35)'; // Red
    case 'SUSPICIOUS':
      return 'rgba(255, 255, 0, 0.37)'; // Yellow
    case 'REAL':
      return 'rgba(0, 255, 0, 0.32)'; // Green
    default:
      return 'transparent';
  }
}

// Function to get reasoning based on classification
function getReasoningForClassification(classification) {
  switch (classification) {
    case 'FAKE':
      return 'This review has been flagged as potentially fake due to suspicious patterns in the text or user behavior.';
    case 'SUSPICIOUS':
      return 'Our system is uncertain about the authenticity of this review. It may require further investigation.';
    case 'REAL':
      return 'This review appears to be genuine based on our analysis.';
    default:
      return 'No classification available for this review.';
  }
}

// Function to highlight reviews
function highlightReviews() {
  console.log('Highlighting reviews');
  const reviews = document.querySelectorAll('.wiI7pd, .OA1nbd, .d5K5Pd');
  console.log('Found reviews:', reviews.length);

  reviews.forEach(review => {
    if (review.classList.contains('processed')) return;

    const classification = analyzeReview(review.textContent);
    console.log(classification);
    
    reviewCounts[classification]++;

    const reasoning = getReasoningForClassification(classification);
    const color = getColorForClassification(classification);
    
    review.classList.add('processed');
    review.style.backgroundColor = color;
    review.style.transition = 'background-color 0.3s';
    review.style.position = 'relative';

    const hoverElement = document.createElement('div');
    hoverElement.className = 'review-hover-info';
    hoverElement.innerHTML = `
      <p><strong>Classification: ${classification}</strong></p>
      <p>${reasoning}</p>
      <button class="report-button">Report</button>
    `;

    hoverElement.style.cssText = `
      position: absolute;
      color: black;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      display: none;
      z-index: 1000;
      width: 300px;
      top: 100%;
      left: 0;
    `;
    review.appendChild(hoverElement);

    review.addEventListener('mouseenter', () => {
      hoverElement.style.display = 'block';
    });

    review.addEventListener('mouseleave', () => {
      hoverElement.style.display = 'none';
    });

    const reportButton = hoverElement.querySelector('.report-button');
    reportButton.style.cssText = `
      background-color: #4CAF50;
      border: none;
      color: white;
      padding: 5px 10px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 14px;
      margin-top: 10px;
      cursor: pointer;
      border-radius: 4px;
    `;
    reportButton.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Reported review:', review.textContent);
      alert('Review reported!');
    });
  });
  chrome.runtime.sendMessage({
    action: "updateCounts",
    counts: reviewCounts
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  if (request.action === "highlightReviews") {
    highlightReviews();
    // Observe for dynamically loaded reviews
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const addedNodes = mutation.addedNodes;
          for (let i = 0; i < addedNodes.length; i++) {
            const node = addedNodes[i];
            if (node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('wiI7pd') || node.classList.contains('OA1nbd') || node.classList.contains('d5K5Pd'))) {
              console.log('New review detected, highlighting');
              highlightReviews();
              break;
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    sendResponse({status: "Highlighting complete", counts: reviewCounts});
  }
  return true;
});