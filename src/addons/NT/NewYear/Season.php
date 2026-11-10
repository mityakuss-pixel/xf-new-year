<?php

declare(strict_types=1);

namespace NT\NewYear;

use NT\NewYear\Option\Period;

class Season
{
	public const MODE_DATES = 'dates';
	public const MODE_ON = 'on';
	public const MODE_OFF = 'off';

	public static function isActive(?int $time = null): bool
	{
		$options = \XF::options();

		switch ($options->ntNewYearMode)
		{
			case self::MODE_ON:
				return true;

			case self::MODE_DATES:
				return self::isInPeriod(
					(string) $options->ntNewYearFrom,
					(string) $options->ntNewYearTo,
					$time ?? \XF::$time,
					(string) $options->guestTimeZone
				);

			default:
				return false;
		}
	}

	public static function isInPeriod(string $from, string $to, int $time, string $timeZone): bool
	{
		$start = Period::parse($from);
		$end = Period::parse($to);
		if ($start === null || $end === null)
		{
			return false;
		}

		try
		{
			$zone = new \DateTimeZone($timeZone);
		}
		catch (\Exception $e)
		{
			$zone = new \DateTimeZone('UTC');
		}

		$date = (new \DateTime('@' . $time))->setTimezone($zone);
		$today = (int) $date->format('n') * 100 + (int) $date->format('j');
		$first = $start['month'] * 100 + $start['day'];
		$last = $end['month'] * 100 + $end['day'];

		if ($first <= $last)
		{
			return $today >= $first && $today <= $last;
		}

		return $today >= $first || $today <= $last;
	}
}
