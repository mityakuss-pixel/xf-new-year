<?php

declare(strict_types=1);

namespace NT\NewYear;

use XF\App;
use XF\Mvc\Entity\Entity;
use XF\Mvc\Entity\Manager;
use XF\Mvc\Entity\Structure;
use XF\Mvc\Reply\AbstractReply;

class Listener
{
	public static function templaterGlobalData(App $app, array &$data, ?AbstractReply $reply): void
	{
		$active = Season::isActive();
		$userOption = \XF::visitor()->Option;
		$disabled = $userOption ? (bool) $userOption->nt_new_year_disabled : false;

		$data['ntNewYear'] = [
			'active' => $active,
			'visible' => $active && !$disabled,
		];
	}

	public static function userOptionEntityStructure(Manager $em, Structure &$structure): void
	{
		$structure->columns['nt_new_year_disabled'] = ['type' => Entity::BOOL, 'default' => false];
	}
}
