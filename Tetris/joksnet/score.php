<?php

$db = mysql_connect('localhost', 'root', '') or die( mysql_error() );
      mysql_select_db('tetris') or die( mysql_error() );

if ( isset($_GET['n']) && isset($_GET['p']) )
{
    $name = addslashes( $_GET['n'] );
    $score = $_GET['p'];

    mysql_query("INSERT INTO tetris (name, score) VALUES ('$name', '$score')");
    header('Location: score.php?rnd=' . rand(0, 9));
    exit();
}

$result = mysql_query('SELECT * FROM tetris ORDER BY score DESC');
$list = ''; $i = 0; $long = strlen( mysql_num_rows($result) );

while ( $row = mysql_fetch_assoc($result) )
{
    $i++;

    $name = $row['name'];
    $score = $row['score'];

    $value = str_pad($i . '. ', $long + 2, ' ', STR_PAD_LEFT);
    $value .= str_pad($name, 21 - strlen($score) - $long - 2, ' ', STR_PAD_RIGHT);
    $value .= $score;

    $list .= '<a href="#">' . $value . '</a>' . "\n";
}

mysql_free_result($result);

echo <<<HTML
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
  <title>4Bricks :: Score</title>
  <link rel="shortcut icon" href="/favicon.ico" />
  <style type="text/css">
  /*<![CDATA[*/
    body, * { padding: 0px; margin: 0px; }
    body h3 { margin-left: 5px; }
    body pre { margin: 5px; font-size: 12px; }
    body a { color: blue; text-decoration: none; }
    body a:hover { color: red; }
  /*]]>*/
  </style>
</head>
<body>
  <h3>High Scores</h3>
  <pre>
$list
  </pre>
</body>
</html>
HTML;
