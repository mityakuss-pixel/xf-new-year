<?php

declare(strict_types=1);

namespace NT\NewYear\Option;

use XF\Entity\Option;

class Period
{
	public static function verifyOption(&$value, Option $option): bool
	{
		$parsed = self::parse((string) $value);
		if ($parsed === null)
		{
			$option->error(\XF::phrase('nt_new_year_period_invalid'), $option->option_id);
			return false;
		}

		$value = sprintf('%02d.%02d', $parsed['day'], $parsed['month']);

		return true;
	}

	public static function parse(string $value): ?array
	{
		if (!preg_match('/^\s*(\d{1,2})\.(\d{1,2})\s*$/', $value, $match))
		{
			return null;
		}

		$day = (int) $match[1];
		$month = (int) $match[2];
		if (!checkdate($month, $day, 2024))
		{
			return null;
		}

		return ['day' => $day, 'month' => $month];
	}
}
