import App from './App.svelte';

const app = new App({
	target: document.body,
	props: { 
		urlBase: "/hardle"
	}
});

export default app;