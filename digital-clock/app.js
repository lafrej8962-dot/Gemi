// List of all available time zones
const allTimeZones = [
    // UTC and GMT
    'UTC', 'GMT',
    // Americas
    'America/Anchorage', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Mexico_City', 'America/New_York', 'America/Toronto', 'America/Vancouver',
    'America/Argentina/Buenos_Aires', 'America/Sao_Paulo', 'America/Caracas',
    // Europe
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
    'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna', 'Europe/Prague', 'Europe/Warsaw',
    'Europe/Athens', 'Europe/Istanbul', 'Europe/Moscow', 'Europe/Dublin',
    // Africa
    'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Morocco',
    // Asia
    'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Singapore', 'Asia/Hong_Kong',
    'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Manila', 'Asia/Jakarta',
    'Asia/Beirut', 'Asia/Tehran', 'Asia/Baghdad', 'Asia/Almaty', 'Asia/Karachi',
    // Australia & Pacific
    'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth',
    'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Honolulu', 'Pacific/Tongatapu'
];

// Default time zones to display
const defaultTimeZones = [
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
];

// Storage key
const STORAGE_KEY = 'digitalClockTimeZones';

// Get location name from timezone
function getLocationName(timezone) {
    return timezone.replace(/_/g, ' ').split('/').pop();
}

// Get country/region from timezone
function getRegion(timezone) {
    return timezone.split('/')[0];
}

// Format time with leading zeros
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// Get current time in a specific timezone
function getTimeInZone(timezone) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const parts = formatter.formatToParts(now);
    const timeObj = {};
    
    parts.forEach(part => {
        timeObj[part.type] = part.value;
    });

    return {
        time: `${timeObj.hour}:${timeObj.minute}:${timeObj.second}`,
        period: parseInt(timeObj.hour) >= 12 ? 'PM' : 'AM',
        date: `${timeObj.month}/${timeObj.day}/${timeObj.year}`,
        offset: getUTCOffset(timezone)
    };
}

// Calculate UTC offset
function getUTCOffset(timezone) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const localeTime = formatter.format(now);
    const utcTime = now.toLocaleString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });

    const [locHour, locMin] = localeTime.split(':').map(Number);
    const [utcHour, utcMin] = utcTime.split(':').map(Number);

    let offset = locHour - utcHour;
    if (offset < -12) offset += 24;
    if (offset > 12) offset -= 24;

    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    return `UTC ${sign}${padZero(Math.floor(absOffset))}:${padZero((absOffset % 1) * 60)}`;
}

// Create clock element
function createClockElement(timezone) {
    const timeData = getTimeInZone(timezone);
    const location = getLocationName(timezone);
    
    const clockDiv = document.createElement('div');
    clockDiv.className = 'clock';
    clockDiv.dataset.timezone = timezone;
    clockDiv.innerHTML = `
        <div class="clock-location">${location}</div>
        <div class="clock-timezone">${timezone}</div>
        <div class="clock-time">${timeData.time}</div>
        <div class="clock-period">${timeData.period}</div>
        <div class="clock-date">${timeData.date}</div>
        <div class="clock-offset">${timeData.offset}</div>
        <button class="clock-remove" onclick="removeTimeZone('${timezone}')">Remove</button>
    `;
    
    return clockDiv;
}

// Update all clocks
function updateAllClocks() {
    const clocks = document.querySelectorAll('.clock');
    clocks.forEach(clock => {
        const timezone = clock.dataset.timezone;
        const timeData = getTimeInZone(timezone);
        clock.querySelector('.clock-time').textContent = timeData.time;
        clock.querySelector('.clock-period').textContent = timeData.period;
        clock.querySelector('.clock-date').textContent = timeData.date;
    });
}

// Load time zones from storage
function loadTimeZones() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultTimeZones;
}

// Save time zones to storage
function saveTimeZones(timeZones) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timeZones));
}

// Add time zone
function addTimeZone(timezone) {
    let timeZones = loadTimeZones();
    if (!timeZones.includes(timezone)) {
        timeZones.push(timezone);
        saveTimeZones(timeZones);
        renderClocks();
    }
}

// Remove time zone
function removeTimeZone(timezone) {
    let timeZones = loadTimeZones();
    timeZones = timeZones.filter(tz => tz !== timezone);
    saveTimeZones(timeZones);
    renderClocks();
}

// Render all clocks
function renderClocks() {
    const container = document.getElementById('clocksContainer');
    const emptyState = document.getElementById('emptyState');
    const timeZones = loadTimeZones();

    container.innerHTML = '';

    if (timeZones.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        timeZones.forEach(timezone => {
            container.appendChild(createClockElement(timezone));
        });
    }
}

// Populate timezone list
function populateTimezoneList(filter = '') {
    const list = document.getElementById('timezoneList');
    const currentTimeZones = loadTimeZones();
    
    list.innerHTML = '';

    allTimeZones
        .filter(tz => !currentTimeZones.includes(tz) && 
                     tz.toLowerCase().includes(filter.toLowerCase()))
        .forEach(timezone => {
            const li = document.createElement('li');
            li.textContent = timezone;
            li.onclick = () => {
                addTimeZone(timezone);
                closeTimezoneSelector();
            };
            list.appendChild(li);
        });
}

// Show timezone selector
function showTimezoneSelector() {
    document.getElementById('timezoneSelector').style.display = 'flex';
    populateTimezoneList();
    document.getElementById('selectorSearchInput').focus();
}

// Close timezone selector
function closeTimezoneSelector() {
    document.getElementById('timezoneSelector').style.display = 'none';
}

// Reset to default
function resetToDefault() {
    if (confirm('Reset to default time zones?')) {
        saveTimeZones(defaultTimeZones);
        renderClocks();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    renderClocks();
    
    // Update clocks every second
    setInterval(updateAllClocks, 1000);
    
    // Add timezone button
    document.getElementById('addZoneBtn').addEventListener('click', showTimezoneSelector);
    
    // Close selector button
    document.getElementById('closeSelectorBtn').addEventListener('click', closeTimezoneSelector);
    
    // Close selector when clicking outside
    document.getElementById('timezoneSelector').addEventListener('click', (e) => {
        if (e.target === document.getElementById('timezoneSelector')) {
            closeTimezoneSelector();
        }
    });
    
    // Timezone search in selector
    document.getElementById('selectorSearchInput').addEventListener('input', (e) => {
        populateTimezoneList(e.target.value);
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetToDefault);
    
    // Search functionality (filters clocks)
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const filter = e.target.value.toLowerCase();
        document.querySelectorAll('.clock').forEach(clock => {
            const location = clock.querySelector('.clock-location').textContent.toLowerCase();
            const timezone = clock.querySelector('.clock-timezone').textContent.toLowerCase();
            if (location.includes(filter) || timezone.includes(filter)) {
                clock.style.display = '';
            } else {
                clock.style.display = 'none';
            }
        });
    });
});
