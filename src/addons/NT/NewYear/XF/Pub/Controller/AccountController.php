<?php

declare(strict_types=1);

namespace NT\NewYear\XF\Pub\Controller;

use XF\Entity\User;

class AccountController extends XFCP_AccountController
{
	protected function preferencesSaveProcess(User $visitor)
	{
		$form = parent::preferencesSaveProcess($visitor);

		if ($this->request->exists('nt_new_year_shown'))
		{
			$disabled = $this->filter('nt_new_year_disabled', 'bool');

			$form->setup(function () use ($visitor, $disabled)
			{
				$visitor->Option->nt_new_year_disabled = $disabled;
			});
		}

		return $form;
	}
}
