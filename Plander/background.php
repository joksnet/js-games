<?php

$imageWidth = 446;
$imageHeight = 386;

//-->

$plataforms = array();

foreach ( $_GET as $key => $value )
{
    if ( substr($key, 0, strlen('p')) == 'p' )
    {
        $value = str_replace('(', '', $value);
        $value = str_replace(')', '', $value);

        $coords = explode(';', $value);
        $plataforms[$key] = array('x' => intval($coords[0]), 'y' => intval($coords[1]));
    }
}

//-->

$image = @imagecreate($imageWidth, $imageHeight);

$colorBackground = imagecolorallocate($image, 238, 238, 238);
$colorLine = imagecolorallocate($image, 160, 160, 160);

$ii = 0;

$x1 = 0;
$y1 = ( $imageHeight / 2 ) + ( $imageHeight / 4 );
$y2 = $y1;

$m1 = 1;
$m2 = 5;

for ( $x = 5; $x < $imageWidth; $x += 5 )
{
    $x1set = false;
    $x2 = $x;

    foreach ( $plataforms as $plataform )
    {
        if ( $plataform['x'] >= $x1 && $plataform['x'] <= $x2 )
        {
            $x1set = true;
            $x2 = $plataform['x'];
            $y2 = $plataform['y'];

            break;
        }
    }

    if ( !( $x1set ) )
    {
        do
        {
            $v += rand($m1, $m2);

            $m1 = $v - 30;
            $m2 = $v + 30;

            if ( $ii % 2 == 0 )
                $v *= -1;

            $ii++;
        } while ( $y2 + $v >= $imageHeight || $y2 + $v <= 46 );

        $y2 += $v;
    }

    imageline($image, $x1, $y1, $x2, $y2, $colorLine);

    $x1 = ( $x1set ) ? $x2 + 62 : $x2;
    $y1 = $y2;

    if ( $x1set )
        $x += 62;

    $ii++;
}

header('Content-type: image/png');

imagepng($image);
imagedestroy($image);