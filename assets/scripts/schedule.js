// Fetch and display schedule data based on filters

document.addEventListener('DOMContentLoaded', () => {
   const scheduleContainer = document.getElementById('schedule-container');
   const divisionFilterContainer = document.getElementById('division-filters');
   const teamFilterContainer = document.getElementById('team-filters');
   const dateFilterContainer = document.getElementById('date-filters');
   const clearFiltersBtn = document.getElementById('clear-filters');

   let scheduleData = [];
   let uniqueDivisions = new Set();
   let uniqueDates = new Set();
   let teamInfo = []; // Array of objects { name: "Team A", division: "10U" }

   let selectedDivisions = new Set();
   let selectedTeams = new Set();
   let selectedDates = new Set();

   // Global map of last game IDs
   let globalLastGames = new Set();

   // Load data
   const scheduleUrl = 'assets/data/schedule.json?v=' + new Date().getTime();

   fetch(scheduleUrl)
      .then(async response => {
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }
         const text = await response.text();
         try {
            return JSON.parse(text);
         } catch (e) {
            console.error('JSON Parse Error:', e);
            console.log('Raw text start:', text.substring(0, 100));
            throw new Error('Failed to parse schedule data. The file may be corrupted.');
         }
      })
      .then(data => {
         if (!Array.isArray(data)) {
            throw new Error('Data format error: Expected an array of games.');
         }

         scheduleData = data.map((game, index) => {
            const homeTeam = String(game["Home Team"] || "");
            const division = game.Division || "Unknown";

            return {
               id: game.GameID || index + 1,
               division: division,
               week: game.Week,
               date: game.Date,
               startTime: game["Start Time"],
               endTime: game["End Time"],
               homeTeam: homeTeam,
               awayTeam: String(game["Away Team"] || ""),
               location: game.Location,
               field: game.Field
            };
         });

         calculateGlobalLastGames(scheduleData);
         extractFilters(scheduleData);
         renderFilters();
         renderSchedule(scheduleData);
      })
      .catch(error => {
         console.error('Error loading schedule:', error);
         if (scheduleContainer) {
            scheduleContainer.innerHTML = `<p class="error">Unable to load schedule data: ${error.message}. Ensure you are running this on a local server (not file://).</p>`;
         }
      });

   function calculateGlobalLastGames(data) {
      globalLastGames = new Set();
      const gamesByDate = {};

      data.forEach(game => {
         if (!gamesByDate[game.date]) gamesByDate[game.date] = [];
         gamesByDate[game.date].push(game);
      });

      Object.keys(gamesByDate).forEach(date => {
         const games = gamesByDate[date];
         const lastByField = {};

         games.forEach(game => {
            const key = `${game.location}_${game.field}`;
            if (!lastByField[key]) {
               lastByField[key] = game;
            } else {
               const timeToMins = (t) => {
                  if (!t) return 0;
                  const [h, m] = t.split(':').map(Number);
                  return h * 60 + m;
               };
               if (timeToMins(game.startTime) > timeToMins(lastByField[key].startTime)) {
                  lastByField[key] = game;
               }
            }
         });

         Object.values(lastByField).forEach(g => globalLastGames.add(g.id));
      });
   }

   function extractFilters(data) {
      uniqueDivisions = new Set();
      uniqueDates = new Set();
      const teamsMap = new Map();

      data.forEach(game => {
         if (game.division) uniqueDivisions.add(game.division);
         if (game.date) uniqueDates.add(game.date);
         if (game.homeTeam) teamsMap.set(game.homeTeam, game.division);
         if (game.awayTeam) teamsMap.set(game.awayTeam, game.division);
      });

      const divArray = Array.from(uniqueDivisions).sort((a, b) => {
         const numA = parseInt(a) || 999;
         const numB = parseInt(b) || 999;
         return numA - numB;
      });
      uniqueDivisions = new Set(divArray);

      teamInfo = Array.from(teamsMap.entries()).map(([name, division]) => ({ name, division }));
      teamInfo.sort((a, b) => {
         const divIndexA = divArray.indexOf(a.division);
         const divIndexB = divArray.indexOf(b.division);
         if (divIndexA !== divIndexB) return divIndexA - divIndexB;
         return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });
   }

   function renderFilters() {
      if (!divisionFilterContainer || !teamFilterContainer) return;

      // Divisions
      divisionFilterContainer.innerHTML = '';
      uniqueDivisions.forEach(div => {
         const label = document.createElement('label');
         label.className = 'checkbox-label';
         label.innerHTML = `<input type="checkbox" value="${div}" class="filter-division"> ${div}`;
         divisionFilterContainer.appendChild(label);
      });

      // Dates
      if (dateFilterContainer) {
         dateFilterContainer.innerHTML = '';
         const sortedDates = Array.from(uniqueDates).sort();
         sortedDates.forEach(date => {
            let labelText = date;
            try {
               const [y, m, d] = date.split('-').map(Number);
               const dateObj = new Date(y, m - 1, d);
               labelText = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            } catch (e) {}

            const label = document.createElement('label');
            label.className = 'checkbox-label';
            label.innerHTML = `<input type="checkbox" value="${date}" class="filter-date"> ${labelText}`;
            dateFilterContainer.appendChild(label);
         });

         document.querySelectorAll('.filter-date').forEach(cb => {
            cb.addEventListener('change', (e) => {
               if (e.target.checked) selectedDates.add(e.target.value);
               else selectedDates.delete(e.target.value);
               filterAndRender();
            });
         });
      }

      // Teams
      renderTeamFilters();

      // Division listeners
      document.querySelectorAll('.filter-division').forEach(cb => {
         cb.addEventListener('change', (e) => {
            if (e.target.checked) selectedDivisions.add(e.target.value);
            else selectedDivisions.delete(e.target.value);
            updateTeamFilterVisibility();
            filterAndRender();
         });
      });
   }

   function renderTeamFilters() {
      teamFilterContainer.innerHTML = '';
      teamInfo.forEach(team => {
         const label = document.createElement('label');
         label.className = 'checkbox-label';
         label.style.display = 'flex';
         label.style.alignItems = 'center';
         label.dataset.division = team.division;

         const divCode = String(team.division).split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
         const divBadge = `<span class="badge badge--${divCode}" style="font-size:0.7em;margin-left:auto;transform:scale(0.9);">${team.division.split(' ')[0]}</span>`;
         label.innerHTML = `<input type="checkbox" value="${team.name}" class="filter-team" style="margin-right:0.5rem;"> <span>${team.name}</span> ${divBadge}`;
         teamFilterContainer.appendChild(label);
      });

      document.querySelectorAll('.filter-team').forEach(cb => {
         cb.addEventListener('change', (e) => {
            if (e.target.checked) selectedTeams.add(e.target.value);
            else selectedTeams.delete(e.target.value);
            filterAndRender();
         });
      });
   }

   function updateTeamFilterVisibility() {
      teamFilterContainer.querySelectorAll('.filter-team').forEach(cb => {
         const label = cb.closest('label');
         const division = label.dataset.division;
         label.style.display = (selectedDivisions.size === 0 || selectedDivisions.has(division)) ? 'flex' : 'none';
      });
   }

   if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
         selectedDivisions.clear();
         selectedTeams.clear();
         selectedDates.clear();
         document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
         document.querySelectorAll('.filter-team').forEach(cb => {
            const label = cb.parentElement;
            if (label) label.style.display = 'flex';
         });
         renderSchedule(scheduleData);
      });
   }

   function filterAndRender() {
      updateTeamFilterVisibility();

      if (selectedDivisions.size === 0 && selectedTeams.size === 0 && selectedDates.size === 0) {
         renderSchedule(scheduleData);
         return;
      }

      const filtered = scheduleData.filter(game => {
         if (selectedDates.size > 0 && !selectedDates.has(game.date)) return false;
         if (selectedTeams.size > 0) return selectedTeams.has(game.homeTeam) || selectedTeams.has(game.awayTeam);
         if (selectedDivisions.size > 0) return selectedDivisions.has(game.division);
         return true;
      });

      renderSchedule(filtered);
   }

   function renderSchedule(games) {
      if (!scheduleContainer) return;

      if (games.length === 0) {
         scheduleContainer.innerHTML = '<p>No games found matching your criteria.</p>';
         return;
      }

      const today = new Date().toISOString().split('T')[0];
      const weeksOb = {};

      games.forEach(game => {
         const w = game.week || 'Unknown Week';
         if (!weeksOb[w]) weeksOb[w] = { dates: {}, maxDate: '0000-00-00' };
         const d = game.date;
         if (d > weeksOb[w].maxDate) weeksOb[w].maxDate = d;
         if (!weeksOb[w].dates[d]) weeksOb[w].dates[d] = [];
         weeksOb[w].dates[d].push(game);
      });

      const sortedWeeks = Object.keys(weeksOb).sort((a, b) => parseInt(a) - parseInt(b));
      let html = '';

      sortedWeeks.forEach(weekNum => {
         const weekData = weeksOb[weekNum];
         const sortedDates = Object.keys(weekData.dates).sort();
         const isPassed = weekData.maxDate < today;
         const openAttr = isPassed ? '' : 'open';

         html += `<details ${openAttr} class="week-group" style="margin-bottom:2rem;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
            <summary style="cursor:pointer;padding:1rem;font-weight:bold;font-size:1.2rem;background-color:#f1f3f5;">
               Week ${weekNum}${isPassed ? ' <span style="font-size:0.85rem;font-weight:normal;color:#666;">(Completed)</span>' : ''}
            </summary>
            <div style="padding:1rem;">`;

         sortedDates.forEach(date => {
            let dateStr = date;
            try {
               const [y, m, d] = date.split('-').map(Number);
               const dateObj = new Date(y, m - 1, d);
               dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            } catch (e) {}

            html += `<h3 class="schedule-date-header">${dateStr}</h3>`;
            html += `<div class="table-responsive"><table class="schedule-table">
               <thead><tr><th>Time</th><th>Division</th><th>Home</th><th>Away</th><th>Location</th></tr></thead>
               <tbody>`;

            weekData.dates[date].sort((a, b) => {
               const toMins = (t) => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
               return toMins(a.startTime) - toMins(b.startTime);
            });

            weekData.dates[date].forEach(game => {
               const formatTime = (t) => {
                  if (!t) return '';
                  try {
                     const [h, m] = t.split(':');
                     const d = new Date(); d.setHours(h, m);
                     return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                  } catch (e) { return t; }
               };

               const timeDisplay = game.endTime ? `${formatTime(game.startTime)} - ${formatTime(game.endTime)}` : formatTime(game.startTime);
               const divisionCode = String(game.division).split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

               let locationContent = `${game.location} - ${game.field}`;
               if (globalLastGames.has(game.id)) {
                  locationContent += '<br><span class="game-note">Last Game - Please Help with Field Tear&#8209;Down</span>';
               }

               html += `<tr>
                  <td data-label="Time" style="white-space:nowrap;">${timeDisplay}</td>
                  <td data-label="Division"><span class="badge badge--${divisionCode}">${game.division}</span></td>
                  <td data-label="Home">${game.homeTeam}</td>
                  <td data-label="Away">${game.awayTeam}</td>
                  <td data-label="Location"><div class="location-content">${locationContent}</div></td>
               </tr>`;
            });

            html += `</tbody></table></div>`;
         });

         html += `</div></details>`;
      });

      scheduleContainer.innerHTML = html;
   }
});
