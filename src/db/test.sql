SELECT name, age, ad.streets, wd.days
FROM   employees e
JOIN  (
   SELECT employeeid, array_agg(ad.street) AS streets
   FROM   address
   GROUP  BY 1
   ) ad ON ad.employeeid = e.id
JOIN  (
   SELECT employeeid, arrag_agg(wd.day) AS days
   FROM   workingdays
   GROUP  BY 1
   ) wd ON wd.employeeid = e.id;


 SELECT
    artist,
    album_name,
    href,
    spotify_album_id,
    uri,
    ai.images,
    at.tracks
FROM albums a
JOIN (
    SELECT album_id, array_agg(row(height, width, url)) AS images
    FROM images
    GROUP BY album_id
) ai ON ai.album_id = a.id
JOIN (
    SELECT album_id, array_agg(row(uri, track_number, name)) AS tracks
    FROM tracks
    GROUP BY album_id
) at ON at.album_id = a.id;

--
SELECT e.id, e.name, e.age, ad.streets, arrag_agg(wd.day) AS days
FROM   employees e
JOIN  (
   SELECT employeeid, array_agg(ad.street) AS streets
   FROM   address
   GROUP  BY 1
   ) ad ON ad.employeeid = e.id
JOIN   workingdays wd ON e.id = wd.employeeid
GROUP  BY e.id, e.name, e.age, ad.streets;


SELECT a.id, a.album_name, array_agg(ai.*) as images
FROM albums a
JOIN (
    SELECT album_id, array_agg(at.*) as tracks
    FROM tracks
    GROUP BY 1
) at ON at.album_id = a.id
JOIN images ai ON a.id = ai.album_id
GROUP BY a.id, a.album_name, at.tracks;






SELECT u.id
     , u.account_balance
     , g.grocery_visits
     , f.fishmarket_visits
FROM   users u
LEFT   JOIN (
   SELECT user_id, count(*) AS grocery_visits
   FROM   grocery
   GROUP  BY user_id
   ) g ON g.user_id = u.id
LEFT   JOIN (
   SELECT user_id, count(*) AS fishmarket_visits
   FROM   fishmarket
   GROUP  BY user_id
   ) f ON f.user_id = u.id
ORDER  BY u.id;



SELECT
    artist,
    album_name,
    href,
    spotify_album_id,
    uri,
    ai.images,
    at.tracks
FROM albums a
JOIN (
    SELECT album_id, json_agg(
        json_build_object(
            'height',
            height,
            'width',
            width,
            'url',
            url
        )
    ) AS images
    FROM images
    GROUP BY album_id
) ai ON ai.album_id = a.id
JOIN (
    SELECT album_id, json_agg(
        json_build_object(
            'uri',
            uri,
            'track_number',
            track_number,
            'name',
            name
        )
    ) AS tracks
    FROM tracks
    GROUP BY album_id
) at ON at.album_id = a.id;
