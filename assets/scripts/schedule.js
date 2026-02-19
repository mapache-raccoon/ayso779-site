// Fetch and display schedule data based on filters

document.addEventListener('DOMContentLoaded', () => {
   const scheduleContainer = document.getElementById('schedule-container');
   const divisionFilterContainer = document.getElementById('division-filters');
   const teamFilterContainer = document.getElementById('team-filters');
   const clearFiltersBtn = document.getElementById('clear-filters');

   let scheduleData = [];
   let uniqueDivisions = new Set();
   let teamInfo = []; // Array of objects { name: "Team A", division: "10U" }

   let selectedDivisions = new Set();
   let selectedTeams = new Set();

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

         // Calculate global last games
         calculateGlobalLastGames(scheduleData);

         extractFilters(scheduleData);
         renderFilters();
         renderSchedule(scheduleData); // Initially show all
      })
      .catch(error => {
         console.error('Error loading schedule:', error);
         if (scheduleContainer) {
            scheduleContainer.innerHTML = `<p class="error">Unable to load schedule data: ${error.message}. Ensure you are running this on a local server (not file://).</p>`;
         }
      });

   // Calculate which games are the last ones on their field for that day across ALL data
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

               // Assuming later start time = later game
               if (timeToMins(game.startTime) > timeToMins(lastByField[key].startTime)) {
                  lastByField[key] = game;
               }
            }
         });

         // Add IDs to global set
         Object.values(lastByField).forEach(g => globalLastGames.add(g.id));
      });
   }

   // Extract unique divisions and teams for filter options
   function extractFilters(data) {
      uniqueDivisions = new Set();
      const teamsMap = new Map(); // Use Map to track unique teams and their divisions

      data.forEach(game => {
         if (game.division) uniqueDivisions.add(game.division);

         if (game.homeTeam) {
            teamsMap.set(game.homeTeam, game.division);
         }
         if (game.awayTeam) {
            teamsMap.set(game.awayTeam, game.division);
         }
      });

      // Sort Divisions: 6U, 8U, 10U, 12U, 14U, 16U, 19U...
      const divArray = Array.from(uniqueDivisions).sort((a, b) => {
         const numA = parseInt(a) || 999;
         const numB = parseInt(b) || 999;
         return numA - numB;
      });
      uniqueDivisions = new Set(divArray);

      // Convert teams map to array for sorting
      teamInfo = Array.from(teamsMap.entries()).map(([name, division]) => ({ name, division }));

      // Sort Teams: Primarily by Division Order, then by Team Name
      teamInfo.sort((a, b) => {
         // Get division index
         const divIndexA = divArray.indexOf(a.division);
         const divIndexB = divArray.indexOf(b.division);

         if (divIndexA !== divIndexB) {
            return divIndexA - divIndexB;
         }
         // Secondary sort by name
         return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });
   }

   // Render checkbox filters
   function renderFilters() {
      if (!divisionFilterContainer || !teamFilterContainer) return;

      // Divisions
      divisionFilterContainer.innerHTML = '';
      uniqueDivisions.forEach(div => {
         const label = document.createElement('label');
         label.className = 'checkbox-label';
         label.innerHTML = `
            <input type="checkbox" value="${div}" class="filter-division">
            ${div}
         `;
         divisionFilterContainer.appendChild(label);
      });

      // Render Teams based on the sorted list
      renderTeamFilters();

      // Add event listeners for Divisions
      document.querySelectorAll('.filter-division').forEach(cb => {
         cb.addEventListener('change', (e) => {
            if (e.target.checked) {
               selectedDivisions.add(e.target.value);
            } else {
               selectedDivisions.delete(e.target.value);
            }
            // Update filter logic
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
         label.style.display = 'flex'; // Default visible
         label.style.alignItems = 'center';
         label.dataset.division = team.division;

         const divCode = String(team.division).split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
         const divBadge = `<span class="badge badge--${divCode}" style="font-size: 0.7em; margin-left: auto; transform: scale(0.9);">${team.division.split(' ')[0]}</span>`;

         label.innerHTML = `
            <input type="checkbox" value="${team.name}" class="filter-team" style="margin-right: 0.5rem;">
            <span>${team.name}</span>
            ${divBadge}
         `;
         teamFilterContainer.appendChild(label);
      });

      document.querySelectorAll('.filter-team').forEach(cb => {
         cb.addEventListener('change', (e) => {
            if (e.target.checked) {
               selectedTeams.add(e.target.value);
            } else {
               selectedTeams.delete(e.target.value);
            }
            filterAndRender();
         });
      });
   }

   function updateTeamFilterVisibility() {
      const teamCheckboxes = teamFilterContainer.querySelectorAll('.filter-team');

      teamCheckboxes.forEach(cb => {
         const label = cb.closest('label');
         const division = label.dataset.division;

         // If no divisions selected -> show all
         // If divisions selected -> show only those in selected divisions
         if (selectedDivisions.size === 0 || selectedDivisions.has(division)) {
            label.style.display = 'flex';
         } else {
            label.style.display = 'none';
         }
      });
   }

   // Clear filters
   if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
         selectedDivisions.clear();
         selectedTeams.clear();
         document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
         // Reset visibility of all team checkboxes
         document.querySelectorAll('.filter-team').forEach(cb => {
            const label = cb.parentElement;
            if (label) label.style.display = 'flex';
         });
         renderSchedule(scheduleData);
      });
   }

   // Filter logic
   function filterAndRender() {
      // If Division is selected, narrow the Team list visibility.
      updateTeamFilterVisibility();

      if (selectedDivisions.size === 0 && selectedTeams.size === 0) {
         renderSchedule(scheduleData);
         return;
      }

      const filtered = scheduleData.filter(game => {
         const inDivision = selectedDivisions.has(game.division);
         const isTeam = selectedTeams.has(game.homeTeam) || selectedTeams.has(game.awayTeam);

         // If teams are selected, they override division selection.
         // Show only games involving the selected teams.
         if (selectedTeams.size > 0) {
            return isTeam;
         }

         // If only divisions are selected (and no teams), then filter by division.
         if (selectedDivisions.size > 0) {
            return inDivision;
         }

         return true; // Should be covered by the initial check, but safe fallback
      });

      renderSchedule(filtered);
   }

   // Render the table
   function renderSchedule(games) {
      if (!scheduleContainer) return;

      if (games.length === 0) {
         scheduleContainer.innerHTML = '<p>No games found matching your criteria.</p>';
         return;
      }

      const gamesByDate = {};
      games.forEach(game => {
         if (!gamesByDate[game.date]) gamesByDate[game.date] = [];
         gamesByDate[game.date].push(game);
      });

      const sortedDates = Object.keys(gamesByDate).sort();

      let html = '';

      sortedDates.forEach(date => {
         // Format display date
         let dateStr = date;
         try {
            const [y, m, d] = date.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);
            dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
         } catch (e) { }

         html += `<h3 class="schedule-date-header">${dateStr}</h3>`;
         html += `<div class="table-responsive"><table class="schedule-table">
            <thead>
               <tr>
                  <th>Time</th>
                  <th>Division</th>
                  <th>Home</th>
                  <th>Away</th>
                  <th>Location</th>
               </tr>
            </thead>
            <tbody>`;

         // Sort games by time
         gamesByDate[date].sort((a, b) => {
            const timeToMins = (t) => {
               if (!t) return 0;
               const [h, m] = t.split(':').map(Number);
               return h * 60 + m;
            };
            return timeToMins(a.startTime) - timeToMins(b.startTime);
         });

         gamesByDate[date].forEach(game => {
            // Convert time to 12h
            const formatTime = (t) => {
               if (!t) return '';
               try {
                  const [h, m] = t.split(':');
                  const timeObj = new Date();
                  timeObj.setHours(h, m);
                  return timeObj.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
               } catch (e) { return t; }
            };

            const startStr = formatTime(game.startTime);
            const endStr = formatTime(game.endTime);
            // If end time exists, show range. Otherwise just start time.
            const timeDisplay = endStr ? `${startStr} - ${endStr}` : startStr;

            // Extract division code for badge style (e.g. "10U" from "10U - Girls")
            const divisionCode = String(game.division).split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

            // Location string
            let locationStr = `${game.location} - ${game.field}`;

            // Append note if it's the last game on this field for the day
            // Only if filtered results include more than just this game (or not filtering by team)
            // But requirement is simple: if game is the last on the field in general context?
            // Actually, we calculated 'lastGameIds' based on the CURRENT filtered list 'gamesByDate[date]'?
            // Yes, because gamesByDate[date] comes from 'games' passed to renderSchedule.
            // So if you filter to just "Team A", and Team A is the only game shown, it will be marked as last game.
            // Is that desired? Usually "Last game of the day" implies responsibility regardless of filter.
            // BUT we only have access to 'games' here. If we want global last game, we need to calculate it outside.
            // For now, let's assume the user viewing the full schedule (or Division) wants to know.
            // If they are looking at just one team, maybe they still want to know?

            // To be accurate, we should probably calculate "Last Game" based on the FULL scheduleData, not the filtered set.
            // However, that requires re-processing all data.
            // Let's stick to the filtered set for now as requested, or clarify.
            // "So if there's no 'game' on that field, after their game."

            // Wait, if I filter to "8:00 AM game", and there is a "10:00 AM game", 
            // the 8:00 AM game is the last one in the FILTERED list.
            // Location string
            let locationContent = `${game.location} - ${game.field}`;

            // Check if it's the global last game for this field on this day
            if (globalLastGames.has(game.id)) {
               locationContent += '<br><span class="game-note">Last Game - Please Help with Field Tear‑Down</span>';
            }

            // Wrap in a div so flex layout on mobile keeps label separate from multiline content
            const locationDisplay = `<div class="location-content">${locationContent}</div>`;

            html += `
                  <tr>
                     <td data-label="Time" style="white-space: nowrap;">${timeDisplay}</td>
                     <td data-label="Division"><span class="badge badge--${divisionCode}">${game.division}</span></td>
                     <td data-label="Home">${game.homeTeam}</td>
                     <td data-label="Away">${game.awayTeam}</td>
                     <td data-label="Location">${locationDisplay}</td>
                  </tr>
               `;
         });

         html += `</tbody></table></div>`;
      });

      scheduleContainer.innerHTML = html;
   }
});
