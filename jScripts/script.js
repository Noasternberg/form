/* ==========================================================================
   קובץ JavaScript ראשי - פרויקט StudySmart
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. תפריט המבורגר רספונסיבי למובייל ולטאבלט
    // ==========================================================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // ==========================================================================
    // 2. סמן עכבר מותאם אישית
    // ==========================================================================
    const cursor = document.getElementById('customCursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

    // ==========================================================================
    // 3. טיימר פומודורו (25 דקות)
    // ==========================================================================
    const totalSeconds = 1500; // 25 דקות * 60 שניות = 1500
    let timeLeft = totalSeconds;
    let pomodoroInterval = null;
    let isTimerRunning = false;

    const startTimerBtn = document.getElementById('startTimerBtn');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const circle = document.querySelector('.progress-ring-active');

    // פונקציית עדכון התצוגה (זמן ועיגול התקדמות)
    function updateTimerVisuals() {
        if (!minutesElement || !secondsElement) {
            console.warn("שגיאה: לא נמצאו אלמנטים של דקות (id='minutes') או שניות (id='seconds') ב-HTML.");
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        minutesElement.innerText = minutes < 10 ? '0' + minutes : minutes;
        secondsElement.innerText = seconds < 10 ? '0' + seconds : seconds;

        if (circle) {
            const circumference = 553;
            const offset = circumference - (timeLeft / totalSeconds) * circumference;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
        }
    }

    // פונקציית כל פעימה של הטיימר (כל שנייה)
    function updateTimerTick() {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerVisuals();
        } else {
            clearInterval(pomodoroInterval);
            isTimerRunning = false;
            if (startTimerBtn) startTimerBtn.innerText = "התחל למידה ▶";
            alert("כל הכבוד! סיימתם 25 דקות של מיקוד. קחו 5 דקות הפסקה.");
            resetPomodoro();
        }
    }

    // פונקציית התחלה/השהיה
    function togglePomodoro() {
        if (!startTimerBtn) return;

        if (isTimerRunning) {
            clearInterval(pomodoroInterval);
            isTimerRunning = false;
            startTimerBtn.innerText = "המשך למידה ▶";
        } else {
            isTimerRunning = true;
            startTimerBtn.innerText = "השהה ⏸";
            pomodoroInterval = setInterval(updateTimerTick, 1000);
        }
    }

    // פונקציית איפוס
    function resetPomodoro() {
        clearInterval(pomodoroInterval);
        isTimerRunning = false;
        timeLeft = totalSeconds;
        if (startTimerBtn) startTimerBtn.innerText = "התחל למידה ▶";
        updateTimerVisuals();
    }

    // חיבור אירוע הלחיצה לכפתור דרך ה-JS
    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', togglePomodoro);
    } else {
        console.warn("שגיאה: לא נמצא כפתור עם ה-ID 'startTimerBtn' ב-HTML.");
    }

    // כפתור איפוס (אופציונלי, במידה ויש לך אחד ב-HTML)
    const resetBtn = document.getElementById('resetTimerBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPomodoro);
    }

    // אתחול ראשוני להצגת 25:00 מיד עם טעינת הדף
    updateTimerVisuals();

    // ==========================================================================
    // 4. מטריצת אייזנהואר - לוגיקת גרירה ושחרור (Drag & Drop)
    // ==========================================================================
    window.allowDrop = function(ev) {
        ev.preventDefault();
    };

    window.drag = function(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    };

    window.drop = function(ev) {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text");
        const draggedElement = document.getElementById(data);

        if (!draggedElement) return;

        let target = ev.target;
        while (target && !target.classList.contains('matrix-box') && !target.classList.contains('notes-pool')) {
            target = target.parentElement;
        }

        if (target) {
            target.appendChild(draggedElement);
        }
    };

    // ==========================================================================
    // 5. מטריצת אייזנהואר - הוספת פתק חדש
    // ==========================================================================
    const addTaskBtn = document.getElementById('addTaskBtn'); // בהנחה שיש כפתור הוספה
    const newTaskInput = document.getElementById('newTaskInput');

    window.addNewTask = function() {
        const input = document.getElementById('newTaskInput');
        const container = document.getElementById('notesContainer');

        if (!input || !container || input.value.trim() === "") {
            return;
        }

        const note = document.createElement('div');
        note.className = 'sticky-note';
        note.id = 'note-' + Date.now();
        note.draggable = true;
        note.innerText = input.value;

        note.ondragstart = window.drag;
        container.appendChild(note);

        input.value = "";
        input.focus();
    };

    // חיבור לחיצת כפתור להוספת משימה, או לחיצה על אנטר במקלדת
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', window.addNewTask);
    }
    if (newTaskInput) {
        newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.addNewTask();
        });
    }

});

// ==========================================================================
// 6. טיפול בשליחת טופס צור קשר ומתן פידבק למשתמש
// ==========================================================================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        // עוצר את השליחה האמיתית לשרת ואת רענון הדף (כי כרגע אין צד-שרת מחובר)
        e.preventDefault();

        // מציג הודעה קופצת (Alert) למשתמש
        alert("תודה רבה! ההודעה שלך נשלחה בהצלחה, נחזור אליך בהקדם.");

        // מנקה את כל השדות בטופס אחרי השליחה
        contactForm.reset();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const flashcard = document.getElementById('demoFlashcard');

    if (flashcard) {
        flashcard.addEventListener('click', function() {
            // היפוך הכרטיסייה ויזואלית
            this.classList.toggle('is-flipped');

            // עדכון חיווי הנגישות לקורא המסך
            const isFlipped = this.classList.contains('is-flipped');
            if (isFlipped) {
                this.setAttribute('aria-label', "צד ב': הפירוש הוא: למידה פעילה (תרגול, מעורבות ויישום). לחצו להפיכת הכרטיסייה חזרה.");
            } else {
                this.setAttribute('aria-label', "צד א': מונח באנגלית: Active Learning. לחצו לחשיפת הפירוש.");
            }
        });
    }
});

// ========================================================================== 
// 7. טופס אינטראקטיבי - מציאת שיטת למידה מותאמת אישית
// ========================================================================== 

// בחירת זמן ריכוז: מציגה את התמונה המתאימה ומסתירה את השנייה
function chooseFocusTime(timeChoice) {
    const morningImage = document.getElementById('morningImage');
    const eveningImage = document.getElementById('eveningImage');

    if (!morningImage || !eveningImage) {
        return;
    }

    morningImage.style.display = 'none';
    eveningImage.style.display = 'none';

    if (timeChoice === 'morning') {
        morningImage.style.display = 'block';
    }
    else {
        eveningImage.style.display = 'block';
    }

    checkStudyForm();
}

// סימון קושי: משנה את שקיפות התמונה ומדגיש אותה אם הצ'קבוקס סומן
function markDifficulty(checkBoxId, imageId) {
    const checkBox = document.getElementById(checkBoxId);
    const imageBox = document.getElementById(imageId);

    if (!checkBox || !imageBox) {
        return;
    }

    if (checkBox.checked) {
        imageBox.style.opacity = '1';
        imageBox.classList.add('selected-difficulty');
    }
    else {
        imageBox.style.opacity = '0.5';
        imageBox.classList.remove('selected-difficulty');
    }
}

// בדיקה האם מולאו שדות החובה: שם + בחירת כפתור רדיו
function checkStudyForm() {
    const studentName = document.getElementById('studentNameMatch');
    const recommendBtn = document.getElementById('studyRecommendBtn');
    const focusOptions = document.getElementsByName('focusTime');
    let isRadioChosen = false;

    if (!studentName || !recommendBtn) {
        return;
    }

    for (let i = 0; i < focusOptions.length; i++) {
        if (focusOptions[i].checked) {
            isRadioChosen = true;
        }
    }

    if (studentName.value.trim() !== '' && isRadioChosen) {
        recommendBtn.disabled = false;
        recommendBtn.style.opacity = '1';
        recommendBtn.style.cursor = 'pointer';
        recommendBtn.classList.remove('disabled-submit');
    }
    else {
        recommendBtn.disabled = true;
        recommendBtn.style.opacity = '0.5';
        recommendBtn.style.cursor = 'not-allowed';
        recommendBtn.classList.add('disabled-submit');
    }
}

// יצירת הודעת המלצה לפי הבחירות בטופס
function showStudyRecommendation() {
    const studentName = document.getElementById('studentNameMatch').value;
    const focusOptions = document.getElementsByName('focusTime');
    const difficultyIds = ['diffProcrastination', 'diffFocus', 'diffLoad', 'diffStress'];
    const resultBox = document.getElementById('studyResult');

    let focusTime = '';
    let difficulties = [];
    let recommendations = [];

    for (let i = 0; i < focusOptions.length; i++) {
        if (focusOptions[i].checked) {
            focusTime = focusOptions[i].value;
        }
    }

    for (let i = 0; i < difficultyIds.length; i++) {
        const currentCheckBox = document.getElementById(difficultyIds[i]);

        if (currentCheckBox && currentCheckBox.checked) {
            difficulties[difficulties.length] = currentCheckBox.value;

            if (currentCheckBox.value === 'דחיינות') {
                recommendations[recommendations.length] = 'להשתמש במטריצת אייזנהואר כדי להחליט מה עושים עכשיו ומה מתזמנים להמשך.';
                recommendations[recommendations.length] = 'להכניס משימות ל-Google Calendar עם דדליין ברור.';
            }
            if (currentCheckBox.value === 'חוסר ריכוז') {
                recommendations[recommendations.length] = 'ללמוד בשיטת פומודורו: 25 דקות למידה ואז 5 דקות הפסקה.';
                recommendations[recommendations.length] = 'להרחיק טלפון ולהכין סביבת למידה שקטה לפני שמתחילים.';
            }
            if (currentCheckBox.value === 'עומס חומר') {
                recommendations[recommendations.length] = 'לחלק את החומר לנושאים קטנים ולסכם כל נושא בנפרד.';
                recommendations[recommendations.length] = 'להשתמש ב-ChatGPT ליצירת שאלות תרגול וב-Quizlet לשינון מושגים.';
            }
            if (currentCheckBox.value === 'לחץ ממבחנים') {
                recommendations[recommendations.length] = 'להתחיל מחזרה קצרה על נושא קל כדי להיכנס לביטחון.';
                recommendations[recommendations.length] = 'לשלב הפסקות נשימה קצרות בין מקטעי הלמידה.';
            }
        }
    }

    if (difficulties.length === 0) {
        difficulties[0] = 'לא סומן קושי מסוים';
        recommendations[0] = 'להמשיך להשתמש בכלי האתר: פומודורו, כלים דיגיטליים ותכנון זמן שבועי.';
    }

    let message = 'שלום ' + studentName + '!\n\n';
    message += 'זמן הלמידה שבו את/ה הכי מרוכז/ת: ' + focusTime + '.\n\n';
    message += 'האתגרים שסימנת:\n';

    for (let i = 0; i < difficulties.length; i++) {
        message += '- ' + difficulties[i] + '\n';
    }

    message += '\nהמלצות StudySmart בשבילך:\n';
    for (let i = 0; i < recommendations.length; i++) {
        message += '- ' + recommendations[i] + '\n';
    }

    alert(message);

    if (resultBox) {
        let htmlText = '<h3>ההמלצה האישית שלך מוכנה!</h3>';
        htmlText += '<p><strong>שם:</strong> ' + studentName + '</p>';
        htmlText += '<p><strong>זמן למידה מועדף:</strong> ' + focusTime + '</p>';
        htmlText += '<p><strong>האתגרים שסומנו:</strong> ' + difficulties.join(', ') + '</p>';
        htmlText += '<p><strong>המלצות:</strong></p><ul>';

        for (let i = 0; i < recommendations.length; i++) {
            htmlText += '<li>' + recommendations[i] + '</li>';
        }

        htmlText += '</ul>';
        resultBox.innerHTML = htmlText;
        resultBox.style.display = 'block';
    }
}
