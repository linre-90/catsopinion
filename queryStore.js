const getNewestPostsCardsQuery = {
    text: "SELECT public.blog_posts.id, title, date, description, image_url, public.blog_post_series.series_name as series FROM public.blog_posts INNER JOIN public.blog_post_series ON public.blog_post_series.id = series ORDER BY date DESC LIMIT 5"
}

const getNewestPostsCards = (async (pool) => {
    const client = await pool.connect();
    try {
        const res = await client.query(getNewestPostsCardsQuery);
        return res.rows;
    } finally {
        console.log("client released top posts");
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
        client.release()
    }
});


const getSinglePost = ( async (pool, id) => {
    let getOnePost = {
        text:"SELECT view FROM public.blog_posts WHERE public.blog_posts.id=$1" ,
        values: [id]
    }
    const client = await pool.connect();
    try {
        const res = await client.query(getOnePost);
        return res.rows[0];
    } finally {
        console.log("client released single post");
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
        client.release()
    }
});

const getCatsOpinionDatabase = ( async (pool, temp, humidity, windspeed, catMessage) => {
    let weatherResquey = {
        text:" SELECT public.info_text_type.type as info_type, message, public.weather_app_message_type.type as message_type FROM public.weather_app_messages INNER JOIN  public.weather_app_message_type ON  public.weather_app_message_type.id = public.weather_app_messages.type INNER JOIN  public.info_text_type ON  public.info_text_type.id = public.weather_app_messages.type_specific WHERE title like $1 or title like $2 or title like $3" ,
        values: [temp, humidity, windspeed]
    }
    let catMessageQuery = {
        text:"SELECT public.info_text_type.type as info_type, public.weather_app_messages.message as catMessage FROM public.weather_app_message_type INNER JOIN public.weather_app_messages ON public.weather_app_messages.type =  public.weather_app_message_type.id INNER JOIN  public.info_text_type ON  public.info_text_type.id= public.weather_app_messages.type_specific WHERE public.weather_app_message_type.type LIKE $1 ORDER BY random() LIMIT 1",
        values:[catMessage]
    }
    const client = await pool.connect();
    try {
        let weatherResponse = await client.query(weatherResquey);
        let catresponse = await client.query(catMessageQuery);
        console.log(catresponse.rows);
        weatherResponse.rows.push(catresponse.rows[0])
        return weatherResponse.rows;
    } finally {
        console.log("client released weather app");
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
        client.release()
    }
});











module.exports = {getNewestPostsCards, getSinglePost, getCatsOpinionDatabase};