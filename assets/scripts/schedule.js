// Fetch and display schedule data based on filters

document.addEventListener('DOMContentLoaded', () => {
   const scheduleContainer = document.getElementById('schedule-container');
   const divisionFilterContainer = document.getElementById('division-filters');
   const teamFilterContainer = document.getElementById('team-filters');
   const clearFiltersBtn = document.getElementById('clear-filters');

   let scheduleData = [];
   let uniqueDivisions = new Set();
   let uniqueTeams = new Set();

   let selectedDivisions = new Set();
   let selectedTeams = new Set();

   // Load data - Updated to handle user-provided headers
   fetch('assets/data/schedule.json')
      .then(response => response.json())
      .then(data => {
         // Normalize keys to standard format
         scheduleData = data.map((game, index) => {
            return {
               id: game.id || game["Order"] || index + 1,
               division: game.division || game["Division"] || "N/A", // User added Division column to Excel
               date: game.date || game["Date"],
               time: game.time || game["Start Time"],
               // Helper to safely stringify values in case Excel numbers are passed
               homeTeam: String(game.homeTeam || game["Home Team"] || ""),
               awayTeam: String(game.awayTeam || game["Away Team"] || ""),
               field: game.field || game["Field"] || game["Location"]
            };
         });
         extractFilters(scheduleData);
         renderFilters();
         renderSchedule(scheduleData); // Initially show all
      })
      .catch(error => {
         console.error('Error loading schedule:', error);
         scheduleContainer.innerHTML = '<p class="error">Unable to load schedule data. Please try again later.</p>';
      });

   // Extract unique divisions and teams for filter options
   function extractFilters(data) {
      data.forEach(game => {
         if (game.division) uniqueDivisions.add(game.division);
         if (game.homeTeam) uniqueTeams.add(game.homeTeam);
         if (game.awayTeam) uniqueTeams.add(game.awayTeam);
      });
      // Sort them
      uniqueDivisions = new Set([...uniqueDivisions].sort());
      uniqueTeams = new Set([...uniqueTeams].sort());
   }

   // Render checkbox filters
   function renderFilters() {
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

      // Teams
      teamFilterContainer.innerHTML = '';
      uniqueTeams.forEach(team => {
         const label = document.createElement('label');
         label.className = 'checkbox-label';
         label.innerHTML = `
        <input type="checkbox" value="${team}" class="filter-team">
        ${team}
      `;
         teamFilterContainer.appendChild(label);
      });

      // Add event listeners to new checkboxes
      document.querySelectorAll('.filter-division').forEach(cb => {
         cb.addEventListener('change', (e) => {
            if (e.target.checked) {
               selectedDivisions.add(e.target.value);
            } else {
               selectedDivisions.delete(e.target.value);
            }
            filterAndRender();
         });
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

   // Clear filters
   if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
         selectedDivisions.clear();
         selectedTeams.clear();
         // Uncheck boxes
         document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
         renderSchedule(scheduleData);
      });
   }

   // Filter logic
   function filterAndRender() {
      // If no filters selected, show all? Or show none? usually show all.
      // Spec: "I want to have drop options to filter. There also needs to be a way to select multiple divisions, and teams."

      // Logic:
      // 1. If divisions selected, filter by division.
      // 2. If teams selected, filter by team.
      // 3. How do they combine? Intersection or Union?
      //    Usually: (Division match) AND (Team match if team selected)
      //    BUT user said: "parent might have a child in 6u and one in 10u" -> selecting multiple divisions.
      //    "I want them to be able to see that view." -> implied Union of selected criteria.

      // Let's try:
      // Show game IF: (No division selected OR game.division in selectedDivisions)
      //           AND (No team selected OR (game.homeTeam in selectedTeams OR game.awayTeam in selectedTeams))

      // Wait, if I select "10U" and "Team A" (which is in 10U), I want to see games for Team A.
      // If I select "10U" and "Team X" (from 6U), I probably want to see 10U games AND Team X games.
      // OR maybe the user uses filters to narrow down?
      // Usually filters narrow down. "Show me 10U games involving Team A".
      // But for "multiple kids", say Kid A (10U) and Kid B (6U).
      // Parent selects 10U and 6U divisions. -> Shows all 10U and 6U games.
      // Parent selects Team Red (10U) and Team Blue (6U). -> Shows Red games and Blue games.

      // Let's go with:
      // If specific Teams are selected, show games involving those teams.
      // If specific Divisions are selected (and NO teams selected), show all games in those divisions.
      // If BOTH are selected?
      // E.g. Select "10U" and "Team A".
      // Logical inclusive OR seems best for "my kids are in these places".
      // "Show me everything relevant to: 10U OR Team A".
      // However, standard UI filters usually mean AND.
      // Let's stick to standard AND logic for Division + Team effectively? No, that conflicts with "different kids".

      // Let's try ISOLATED filters first.
      // Games matching ANY of the selected teams OR matching ANY of the selected divisions?
      // That might be too broad if I just tick "10U" and "6U", I get all games for both. That's good.
      // If I tick "Team A" and "Team B", I get games for both. That's good.
      // What if I tick "10U" and "Team B" (where Team B is 6U)?
      // I probably want to see 10U games AND Team B games.

      // Default mode: If no filters, show all.
      // If filters exist: Match if (Division is in selectedDivisions) OR (Team is in selectedTeams).

      const filtered = scheduleData.filter(game => {
         const divMatch = selectedDivisions.size === 0 || selectedDivisions.has(game.division);

         // Team match is true if NO teams selected, OR if this game involves a selected team.
         // But if I use OR logic for the whole expression:
         // (selectedDivisions.has(game.division)) OR (selectedTeams.has(home) || selectedTeams.has(away))
         // If I select 10U, I get all 10U.
         // If I select Team A, I get all Team A.
         // If I select 10U AND Team A. I should get (10U games) U (Team A games).

         // However, if I select 10U, I might ONLY want 10U.
         // If I have 10U selected, and 0 teams selected -> All 10U.
         // If I have 0 divisions selected, and Team A selected -> All Team A.

         const inDivision = selectedDivisions.has(game.division);
         const isTeam = selectedTeams.has(game.homeTeam) || selectedTeams.has(game.awayTeam);

         // If nothing selected at all -> Show all
         if (selectedDivisions.size === 0 && selectedTeams.size === 0) return true;

         // If only divisions selected -> Show matches in division
         if (selectedDivisions.size > 0 && selectedTeams.size === 0) return inDivision;

         // If only teams selected -> Show matches for team
         if (selectedDivisions.size === 0 && selectedTeams.size > 0) return isTeam;

         // If both selected -> Union
         return inDivision || isTeam;
      });

      renderSchedule(filtered);
   }

   // Render the table
   function renderSchedule(games) {
      if (games.length === 0) {
         scheduleContainer.innerHTML = '<p>No games found matching your criteria.</p>';
         return;
      }

      // Group by Date for cleaner display
      const gamesByDate = {};
      games.forEach(game => {
         if (!gamesByDate[game.date]) gamesByDate[game.date] = [];
         gamesByDate[game.date].push(game);
      });

      // Sort dates
      const sortedDates = Object.keys(gamesByDate).sort();

      let html = '';

      sortedDates.forEach(date => {
         // Format date
         const dateObj = new Date(date + 'T00:00:00'); // Ensure local time parsing roughly
         const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

         html += `<h3 class="schedule-date-header">${dateStr}</h3>`;
         html += `<div class="table-responsive"><table class="schedule-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Division</th>
            <th>Home</th>
            <th>Away</th>
            <th>Field</th>
          </tr>
        </thead>
        <tbody>`;

         // Sort games by time within date
         gamesByDate[date].sort((a, b) => a.time.localeCompare(b.time));

         gamesByDate[date].forEach(game => {
            // Convert 24h time to 12h roughly for display
            const [h, m] = game.time.split(':');
            const timeObj = new Date();
            timeObj.setHours(h, m);
            const timeStr = timeObj.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

            html += `
          <tr>
            <td>${timeStr}</td>
            <td><span class="badge badge--${game.division.replace(/\s+/g, '-').toLowerCase()}">${game.division}</span></td>
            <td>${game.homeTeam}</td>
            <td>${game.awayTeam}</td>
            <td>${game.field}</td>
          </tr>
        `;
         });

         html += `</tbody></table></div>`;
      });

      scheduleContainer.innerHTML = html;
   }

});
