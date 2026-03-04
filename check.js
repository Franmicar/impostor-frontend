fetch('https://impostor-frontend-teal.vercel.app/')
    .then(res => res.text())
    .then(html => {
        const match = html.match(/src="(main-[^\"]+\.js)"/);
        if (match) {
            console.log('Found bundle:', match[1]);
            return fetch('https://impostor-frontend-teal.vercel.app/' + match[1]);
        }
    })
    .then(res => res.text())
    .then(text => {
        console.log('Contains localhost:', text.includes('http://localhost:3000'));
        console.log('Contains prod API:', text.includes('impostor-backend-eight.vercel.app'));
    })
    .catch(console.error);
