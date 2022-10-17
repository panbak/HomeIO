const bcrypt = require('bcrypt');

// bcrypt.genSalt().then(salt => {
//     bcrypt.hash('1234567890', salt).then(p => {
//         console.log(p);
bcrypt.compare('1234567890', '$2b$10$qHU6ADm5pbxReWEsX9Skoes4cymBjLuLS.JteuJ3xSs1HE5..5UKK').then(res => {
    console.log(res);
});
//     });
// });

// $2b$10$D/5gNQI7vUT7hXK0FV4sueZtx/6hFChjin7YOnJN9.rW9iehsLrKK

