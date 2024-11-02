export async function fetchFromStrapi(endpoint) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/${endpoint}`);
    return res.json();
}
