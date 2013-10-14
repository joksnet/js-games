<?php

$pieceWidth = 64;
$pieceHeight = 64;

$divWidth = ( isset($_POST['divWidth']) ) ? $_POST['divWidth'] : 4;
$divHeight = ( isset($_POST['divHeight']) ) ? $_POST['divHeight'] : 4;

function createMosaic( $imgOrig, $folder, $pos )
{
    global $pieceWidth, $pieceHeight;
    global $divWidth, $divHeight;

    $fileOrig = $folder . 'orig.jpg';
    $fileImg = $folder . 'p' . $pos . '.jpg';

    $img = imagecreatetruecolor($pieceWidth, $pieceHeight);

    $posX = ( $pos + 1 ) % $divWidth;
    $posY = intval($pos / $divHeight);

    if ( $posX == 0 )
        $posX = $divWidth;

    $X = ( $posX - 1 ) * $pieceWidth;
    $Y = $posY * $pieceHeight;

    imagecopy($img, $imgOrig, 0, 0, $X, $Y, $pieceWidth, $pieceHeight);
    imagejpeg($img, $fileImg, 90);
    imagedestroy($img);
}

if ( $_FILES['mosaic']['size'] > 0 && $_FILES['mosaic']['error'] == UPLOAD_ERR_OK )
{
    $db = mysql_connect('localhost', 'root', '') or die( mysql_error() );
          mysql_select_db('jpuzzle15') or die( mysql_error() );

    $name = addslashes( $_POST['name'] );
    $board = $divWidth . 'x' . $divHeight;
    $query = mysql_query("INSERT INTO puzzle_levels (name, board) VALUES ('$name', '$board')");
    $id = mysql_insert_id();

    $pathinfo = pathinfo($_FILES['mosaic']['name']);
    $ext = $pathinfo['extension'];

    $fileFolder = 'levels/level' . $id . '/';
    $fileOrig = $fileFolder . 'orig.' . $ext;

    mkdir($fileFolder);

    if ( move_uploaded_file( $_FILES['mosaic']['tmp_name'], $fileOrig ) )
    {
        $imgOrig = imagecreatefromjpeg($fileOrig);

        for ( $i = 0, $l = ( $divWidth * $divHeight ) - 1; $i < $l; $i++ )
            createMosaic($imgOrig, $fileFolder, $i);
    }
}

header('Location: index.html');
