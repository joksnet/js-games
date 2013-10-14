<?php

$db = mysql_connect('localhost', 'root', '') or die( mysql_error() );
      mysql_select_db('jpuzzle15') or die( mysql_error() );

if ( isset($_POST['add']) )
{
    $name = addslashes( $_POST['name'] );
    $board = addslashes( $_POST['board'] );
    $time = $_POST['time'];
    $moves = $_POST['moves'];
    $level = $_POST['level'];

    mysql_query("INSERT INTO puzzle (name, board, time, moves, level)
                 VALUES ('$name', '$board', '$time', '$moves', '$level')");
}

function getScores( $orderBy = 'time' )
{
    $result = mysql_query('SELECT puzzle.*, puzzle_levels.name AS lname FROM puzzle LEFT JOIN puzzle_levels ON puzzle_levels.id = puzzle.level ORDER BY puzzle.' . $orderBy . ' ASC');
    $return = array();

    while ( $row = mysql_fetch_assoc($result) )
    {
        $return[] = sprintf("{name:'%s',board:'%s',time:'%s',moves:'%s',level:'%s',lname:'%s'}",
            $row['name'],
            $row['board'],
            $row['time'],
            $row['moves'],
            $row['level'],
            $row['lname']
        );
    }

    mysql_free_result($result);

    return '[' . implode(',', $return) . ']';
}

$print = array();
$print[] = 'times:' . getScores();
$print[] = 'moves:' . getScores('moves');

echo '{' . implode(',', $print) . '}';
