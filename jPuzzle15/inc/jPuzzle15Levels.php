<?php

$db = mysql_connect('localhost', 'bundleweb', 'b7ndl323b') or die( mysql_error() );
      mysql_select_db('bundleweb') or die( mysql_error() );

$result = mysql_query('SELECT * FROM puzzle_levels');
$return = array();

while ( $row = mysql_fetch_assoc($result) )
{
    $return[] = sprintf("{name:'%s',level:'%s',board:'%s'}",
        $row['name'],
        $row['id'],
        $row['board']
    );
}

mysql_free_result($result);

echo '[' . implode(',', $return) . ']';